"""
중복 뉴스 제거 엔진 — Jaccard 유사도

동일 사건에 대한 여러 출처의 뉴스를 하나로 병합합니다.
유사도 임계값 (기본 0.4)을 초과하면 중복으로 판정합니다.
"""


def jaccard_similarity(text_a: str, text_b: str) -> float:
    """
    두 텍스트의 Jaccard 유사도 계산

    :param text_a: 비교 텍스트 A
    :param text_b: 비교 텍스트 B
    :return: 유사도 (0.0 ~ 1.0)
    """
    set_a = set(text_a.lower().split())
    set_b = set(text_b.lower().split())

    if not set_a or not set_b:
        return 0.0

    intersection = set_a & set_b
    union = set_a | set_b

    return len(intersection) / len(union)


def deduplicate_news(
    news_items: list[dict],
    threshold: float = 0.4,
    key: str = "title",
) -> list[dict]:
    """
    중복 뉴스 제거

    :param news_items: 뉴스 항목 리스트
    :param threshold: 유사도 임계값 (0.4 = 40% 이상 유사하면 중복)
    :param key: 비교할 필드명 (기본: title)
    :return: 중복 제거된 뉴스 리스트
    """
    if not news_items:
        return []

    unique: list[dict] = [news_items[0]]

    for item in news_items[1:]:
        is_duplicate = False
        item_text = item.get(key, "")

        for existing in unique:
            existing_text = existing.get(key, "")
            similarity = jaccard_similarity(item_text, existing_text)

            if similarity >= threshold:
                is_duplicate = True
                # 중복 시: 신뢰도가 높은 쪽을 유지
                if item.get("confidence", 0) > existing.get("confidence", 0):
                    unique.remove(existing)
                    unique.append(item)
                break

        if not is_duplicate:
            unique.append(item)

    return unique
