# Traklin AJAX Endpoint Usage

This project extracts filter metadata from Traklin category pages so you can call the product AJAX endpoint directly without using the website UI.

## Endpoint

Base path:

```text
https://www.traklin.co.il/ajax/category_contents.ashx
```

This endpoint returns product payloads for a category and its active filters.

## Required Parameters

These are the parameters you need for a basic request:

- `fk_content_id`: numeric category ID used by the endpoint
- `page_number`: page number to fetch, starting at `1`
- `vs`: use `0`
- `t`: timestamp-like cache buster; any changing integer value works

Minimal example:

```text
https://www.traklin.co.il/ajax/category_contents.ashx?fk_content_id=175&page_number=1&vs=0&t=1712345678901
```

## Filter Parameters

The extracted JSON files in [`data/categories/`](/Users/majdbishara/AntiGravityProjects/AttributeExtract/data/categories) tell you which filter IDs map to which request parameters.

The main filter parameters are:

- `pm`: manufacturer / brand IDs
- `pfacg`: generic facet IDs
- `prange`: price range, formatted as `min,max`
- `st`: sort option

Multiple values for `pm` and `pfacg` are passed as comma-separated IDs.

Examples:

- `pm=361` means brand `LG`
- `pm=361,380` means `LG` or `SAMSUNG`
- `pfacg=1812,1813` means multiple facet selections
- `prange=1000,5000` means prices from `1000` to `5000`

## Where To Get Filter IDs

Use the extracted category filter files, for example:

- [data/categories/traklin_tv_filters.json](/Users/majdbishara/AntiGravityProjects/AttributeExtract/data/categories/traklin_tv_filters.json)
- [data/categories/traklin_fridges_filters.json](/Users/majdbishara/AntiGravityProjects/AttributeExtract/data/categories/traklin_fridges_filters.json)

Each file contains groups like:

```json
{
  "group_name": "מותגים",
  "param": "pm",
  "options": [
    { "id": 361, "label": "LG" },
    { "id": 380, "label": "SAMSUNG" }
  ]
}
```

and:

```json
{
  "group_name": "טכנולוגיית מסך",
  "param": "pfacg",
  "options": [
    { "id": 1812, "label": "OLED" },
    { "id": 1300, "label": "QLED" }
  ]
}
```

## Building a Request

The request flow is:

1. Choose the category.
2. Get its `fk_content_id`.
3. Resolve the desired filter labels to IDs from the extracted JSON.
4. Build the query string with `pm`, `pfacg`, `prange`, and optional `st`.
5. Call the AJAX endpoint directly.

Example shape:

```text
/ajax/category_contents.ashx?fk_content_id=<CATEGORY_ID>&page_number=1&vs=0&t=<TIMESTAMP>&pm=<BRAND_IDS>&pfacg=<FACET_IDS>&prange=<MIN,MAX>&st=<SORT_ID>
```

## Known Category IDs

From the requests validated during extraction:

- TVs: `fk_content_id=175`
- Fridges: `fk_content_id=176`

If you need the `fk_content_id` for another category, capture one request from the page once and reuse it for that category.

## Examples

### LG OLED 55-inch TVs

From the TV filter map:

- `LG` => `pm=361`
- `OLED` => `pfacg=1812`
- `55-inch` => `pfacg=1813`

Request:

```text
https://www.traklin.co.il/ajax/category_contents.ashx?fk_content_id=175&page_number=1&vs=0&t=1712345678901&pm=361&pfacg=1812,1813
```

### TCL QLED 43-inch TVs

From the TV filter map:

- `TCL` => `pm=483`
- `QLED` => `pfacg=1300`
- `43-inch` => `pfacg=2807`

Request:

```text
https://www.traklin.co.il/ajax/category_contents.ashx?fk_content_id=175&page_number=1&vs=0&t=1712345678901&pm=483&pfacg=1300,2807
```

### Fridges With Water/Ice Kiosk

From the fridge filter map:

- `קיוסק קרח / מים קרים` => `pfacg=1936`

Request:

```text
https://www.traklin.co.il/ajax/category_contents.ashx?fk_content_id=176&page_number=1&vs=0&t=1712345678901&pfacg=1936
```

## Pagination

Use `page_number` to fetch more results:

- `page_number=1`
- `page_number=2`
- `page_number=3`

Keep all other parameters the same.

## Response Notes

The endpoint returns JSON. Fields observed in responses include:

- `Current_page_number`
- `Next_data_json_url`
- `Contents`

`Contents` holds the products for that page.

## Practical Notes

- `t` is used like a cache buster. A current timestamp in milliseconds is sufficient.
- `vs=0` was used in all working requests tested here.
- Filter IDs are category-specific. Do not assume the same ID means the same thing across categories.
- The extracted `source_url` is useful for traceability, but the actual querying depends on the filter IDs and `fk_content_id`.
- Brand filters use `pm`; most other attribute filters use `pfacg`.

## Recommended Workflow

1. Refresh the filter corpus with:

```bash
python3 scripts/refresh_traklin_filters.py
```

2. Load the relevant file in `data/categories/`.
3. Resolve human labels to IDs.
4. Build the AJAX URL.
5. Parse `Contents` from the JSON response.
