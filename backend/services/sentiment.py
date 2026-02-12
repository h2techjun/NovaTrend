"""
AI 감성 분석 서비스 — HuggingFace Transformers

모델:
- 한국어: snunlp/KR-FinBert-SC (금융 특화)
- 영어: ProsusAI/finbert (금융 특화)

4단계 등급 변환:
- 강한 긍정 (신뢰도 > 0.8) → 대박호재
- 약한 긍정 → 호재
- 약한 부정 → 악재
- 강한 부정 (신뢰도 > 0.8) → 대박악재
"""

import os
from typing import Optional

# AI 모델 lazy loading (서버 시작 시 즉시 로드하지 않음)
_pipeline = None


def _get_pipeline():
    """감성 분석 파이프라인 lazy 초기화"""
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline
            model_name = os.getenv(
                "SENTIMENT_MODEL",
                "snunlp/KR-FinBert-SC",
            )
            _pipeline = pipeline(
                "text-classification",
                model=model_name,
                top_k=None,
            )
        except Exception as e:
            print(f"[감성 분석] 모델 로드 실패: {e}")
            _pipeline = None
    return _pipeline


def analyze_sentiment(text: str) -> dict:
    """
    텍스트 감성 분석

    :param text: 분석할 텍스트 (뉴스 헤드라인 또는 요약)
    :return: {"grade": "big_good|good|bad|big_bad", "confidence": 0.0~1.0}
    """
    pipe = _get_pipeline()

    if pipe is None:
        # 모델 미로드 시 기본값 반환 (데모 모드)
        return {"grade": "good", "confidence": 0.5}

    try:
        results = pipe(text[:512])  # 최대 512 토큰

        if not results or not results[0]:
            return {"grade": "good", "confidence": 0.5}

        # 가장 높은 점수 레이블 추출
        top = max(results[0], key=lambda x: x["score"])
        label = top["label"].lower()
        score = top["score"]

        return {
            "grade": _map_to_grade(label, score),
            "confidence": round(score, 4),
        }
    except Exception as e:
        print(f"[감성 분석] 분석 오류: {e}")
        return {"grade": "good", "confidence": 0.5}


def _map_to_grade(label: str, confidence: float) -> str:
    """
    모델 출력을 4단계 등급으로 변환

    KR-FinBert-SC 레이블: positive, negative, neutral
    ProsusAI/finbert 레이블: positive, negative, neutral
    """
    if "positive" in label or "긍정" in label:
        return "big_good" if confidence > 0.8 else "good"
    elif "negative" in label or "부정" in label:
        return "big_bad" if confidence > 0.8 else "bad"
    else:
        # neutral — 약간의 긍정으로 처리
        return "good" if confidence > 0.6 else "bad"
