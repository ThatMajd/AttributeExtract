from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Category:
    key: str
    name: str
    url: str
    fk_content_id: int | None = None


TOP_LEVEL_CATEGORIES: tuple[Category, ...] = (
    Category("home_garden", "לבית ולגן", "https://www.traklin.co.il/לבית_ולגן", 2998),
    Category("electronics", "מסכים ואלקטרוניקה", "https://www.traklin.co.il/מוצרי_אלקטרוניקה", 4),
    Category("hvac", "מיזוג וחימום", "https://www.traklin.co.il/מוצרי_מיזוג_וחימום_לבית", 1631),
    Category("cooking_baking", "בישול ואפייה", "https://www.traklin.co.il/בישול_ואפייה", 1624),
    Category("kitchen", "למטבח", "https://www.traklin.co.il/מוצרי_חשמל_למטבח", 5),
    Category("refrigerators_freezers", "מקררים ומקפיאים", "https://www.traklin.co.il/מקררים_ומקפיאים", 1622),
    Category("cleaning_laundry", "נקיון וכביסה", "https://www.traklin.co.il/נקיון_וכביסה", 1620),
    Category("beauty", "טיפוח ועיצוב", "https://www.traklin.co.il/מוצרי_טיפוח_ועיצוב", 16),
    Category("leisure_sports", "פנאי וספורט", "https://www.traklin.co.il/פנאי_וספורט", 20351),
    Category("gaming_mobile", "גיימינג וסלולר", "https://www.traklin.co.il/גיימינג_וסלולר", 15068),
)


SUPPLEMENTAL_CATEGORIES: tuple[Category, ...] = (
    Category("tv", "טלוויזיות ומסכים", "https://www.traklin.co.il/מוצרי_אלקטרוניקה/טלוויזיות_ומסכים", 175),
    Category("fridges", "מקררים", "https://www.traklin.co.il/מקררים_ומקפיאים/מקררים", 176),
)


ALL_CATEGORIES: tuple[Category, ...] = TOP_LEVEL_CATEGORIES + SUPPLEMENTAL_CATEGORIES
