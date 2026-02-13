"""
AI 감성 분석 서비스 — HuggingFace Inference API (HTTP)

torch/transformers 설치 불필요. HTTP로 HuggingFace API 호출.

4단계 등급:
- 강한 긍정 (신뢰도 > 0.8) → 대박호재
- 약한 긍정 → 호재
- 약한 부정 → 악재
- 강한 부정 (신뢰도 > 0.8) → 대박악재
"""

import os
import httpx

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
SENTIMENT_MODEL = os.getenv("SENTIMENT_MODEL", "snunlp/KR-FinBert-SC")
API_URL = f"https://api-inference.huggingface.co/models/{SENTIMENT_MODEL}"


async def analyze_sentiment(text: str) -> dict:
    """
    텍스트 감성 분석 (HuggingFace Inference API)

    :param text: 분석할 텍스트 (뉴스 헤드라인)
    :return: {"grade": "big_good|good|bad|big_bad", "confidence": 0.0~1.0}
    """
    if not HUGGINGFACE_API_KEY:
        return {"grade": "good", "confidence": 0.5}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                API_URL,
                headers={"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"},
                json={"inputs": text[:512]},
            )

            if response.status_code == 503:
                # 모델 로딩 중 — 기본값 반환
                return {"grade": "good", "confidence": 0.5}

            response.raise_for_status()
            results = response.json()

        if not results or not isinstance(results, list):
            return {"grade": "good", "confidence": 0.5}

        # 결과 형태: [[{"label": "긍정", "score": 0.9}, ...]]
        scores = results[0] if isinstance(results[0], list) else results

        top = max(scores, key=lambda x: x["score"])
        label = top["label"].lower()
        score = top["score"]

        return {
            "grade": _map_to_grade(label, score),
            "confidence": round(score, 4),
        }
    except Exception as e:
        print(f"[감성 분석] API 오류: {e}")
        return {"grade": "good", "confidence": 0.5}


def _map_to_grade(label: str, confidence: float) -> str:
    """모델 출력을 4단계 등급으로 변환"""
    if "positive" in label or "긍정" in label:
        return "big_good" if confidence > 0.8 else "good"
    elif "negative" in label or "부정" in label:
        return "big_bad" if confidence > 0.8 else "bad"
    else:
        # neutral
        return "good" if confidence > 0.6 else "bad"
