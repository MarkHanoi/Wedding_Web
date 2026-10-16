from pathlib import Path
import fitz

source = Path("attached_assets/test_1792175750632.pdf")
output = Path(".agents/outputs/test_1792175750632")
output.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
for index, page in enumerate(document, start=1):
    image = page.get_pixmap(matrix=fitz.Matrix(3, 3), alpha=False)
    image.save(output / f"page-{index}.png")
    print(f"Rendered page {index}: {page.rect}")

crop_regions = {
    1: [
        ("weekend-and-venue", fitz.Rect(30, 150, 600, 690)),
        ("weekend-directions-note", fitz.Rect(30, 450, 610, 680)),
    ],
    2: [
        ("travel-notes", fitz.Rect(35, 20, 610, 315)),
        ("dress-code-notes", fitz.Rect(35, 330, 610, 560)),
    ],
    3: [
        ("faq-notes", fitz.Rect(35, 20, 610, 190)),
        ("rsvp-event-options", fitz.Rect(35, 190, 610, 310)),
        ("rsvp-arrival-option", fitz.Rect(35, 280, 610, 360)),
    ],
}
for page_number, regions in crop_regions.items():
    page = document[page_number - 1]
    for label, bounds in regions:
        page.get_pixmap(
            matrix=fitz.Matrix(3, 3),
            clip=bounds,
            alpha=False,
        ).save(output / f"{page_number}-{label}.png")

fine_crops = {
    2: [
        ("travel-getting-here-detail", fitz.Rect(100, 65, 520, 175)),
        ("travel-stay-and-dinner-detail", fitz.Rect(100, 170, 520, 310)),
        ("dress-card-detail", fitz.Rect(0, 345, 340, 510)),
    ],
    3: [
        ("rsvp-fields-detail", fitz.Rect(30, 185, 420, 360)),
    ],
}
for page_number, regions in fine_crops.items():
    page = document[page_number - 1]
    for label, bounds in regions:
        page.get_pixmap(matrix=fitz.Matrix(6, 6), clip=bounds, alpha=False).save(
            output / f"{page_number}-{label}.png"
        )
