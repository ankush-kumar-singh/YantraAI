# ============================================================
# YantraAI - Adaptive PDF Generator
# JSON -> PDF
# ============================================================

import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    ListFlowable,
    ListItem
)


# ============================================================
# HELPERS
# ============================================================

def safe_filename(name):

    name = str(name or "document")

    name = re.sub(
        r'[<>:"/\\|?*]',
        "_",
        name
    )

    return name.strip().replace(
        " ",
        "_"
    )


def humanize_key(key):

    key = str(key)

    key = key.replace(
        "_",
        " "
    )

    key = re.sub(
        r"([a-z])([A-Z])",
        r"\1 \2",
        key
    )

    return key.title()


def format_value(value):

    if value is None:
        return ""

    if isinstance(value, bool):
        return "Yes" if value else "No"

    if isinstance(
        value,
        (dict, list)
    ):

        return json.dumps(
            value,
            ensure_ascii=False
        )

    return str(value)


# ============================================================
# PDF GENERATOR
# ============================================================

class AdaptivePDFGenerator:

    def __init__(
        self,
        data,
        output_path
    ):

        self.data = data

        self.output_path = Path(
            output_path
        )

        formatting = (
            data.get(
                "formatting",
                {}
            )
        )

        # Support formatting inside content
        if not formatting:

            content = data.get(
                "content",
                {}
            )

            if isinstance(
                content,
                dict
            ):

                formatting = content.get(
                    "formatting",
                    {}
                )

        if not isinstance(
            formatting,
            dict
        ):

            formatting = {}

        self.font_name = formatting.get(
            "font",
            "Helvetica"
        )

        self.font_size = (
            self.parse_font_size(
                formatting.get(
                    "size",
                    10
                )
            )
        )

        self.styles = (
            getSampleStyleSheet()
        )

        self.setup_styles()

    # ========================================================
    # FONT SIZE
    # ========================================================

    def parse_font_size(
        self,
        value
    ):

        try:

            match = re.search(
                r"\d+(?:\.\d+)?",
                str(value)
            )

            if match:

                return float(
                    match.group()
                )

        except Exception:
            pass

        return 10

    # ========================================================
    # STYLES
    # ========================================================

    def setup_styles(self):

        self.title_style = (
            ParagraphStyle(
                "YantraTitle",
                parent=self.styles["Title"],
                fontName=self.font_name,
                fontSize=self.font_size + 7,
                leading=self.font_size + 10,
                alignment=TA_CENTER,
                spaceAfter=12
            )
        )

        self.heading_style = (
            ParagraphStyle(
                "YantraHeading",
                parent=self.styles["Heading1"],
                fontName=self.font_name,
                fontSize=self.font_size + 3,
                leading=self.font_size + 5,
                spaceBefore=10,
                spaceAfter=6
            )
        )

        self.subheading_style = (
            ParagraphStyle(
                "YantraSubHeading",
                parent=self.styles["Heading2"],
                fontName=self.font_name,
                fontSize=self.font_size + 1,
                leading=self.font_size + 3,
                spaceBefore=8,
                spaceAfter=5
            )
        )

        self.body_style = (
            ParagraphStyle(
                "YantraBody",
                parent=self.styles["BodyText"],
                fontName=self.font_name,
                fontSize=self.font_size,
                leading=self.font_size + 4,
                alignment=TA_LEFT,
                spaceAfter=5
            )
        )

        self.small_style = (
            ParagraphStyle(
                "YantraSmall",
                parent=self.styles["BodyText"],
                fontName=self.font_name,
                fontSize=max(
                    self.font_size - 1,
                    7
                ),
                leading=self.font_size + 2
            )
        )

    # ========================================================
    # ESCAPE HTML
    # ========================================================

    def escape_text(
        self,
        value
    ):

        text = format_value(
            value
        )

        text = text.replace(
            "&",
            "&amp;"
        )

        text = text.replace(
            "<",
            "&lt;"
        )

        text = text.replace(
            ">",
            "&gt;"
        )

        return text

    # ========================================================
    # PARAGRAPH
    # ========================================================

    def paragraph(
        self,
        text,
        style=None
    ):

        return Paragraph(
            self.escape_text(text),
            style or self.body_style
        )

    # ========================================================
    # TABLE
    # ========================================================

    def make_table(
        self,
        columns,
        rows,
        title=None
    ):

        elements = []

        if title:

            elements.append(
                Paragraph(
                    self.escape_text(
                        title
                    ),
                    self.subheading_style
                )
            )

            elements.append(
                Spacer(
                    1,
                    4
                )
            )

        if not columns:
            return elements

        table_data = []

        # ----------------------------------------------------
        # HEADER
        # ----------------------------------------------------

        header = []

        for column in columns:

            header.append(
                Paragraph(
                    self.escape_text(
                        humanize_key(
                            column
                        )
                    ),
                    self.small_style
                )
            )

        table_data.append(
            header
        )

        # ----------------------------------------------------
        # ROWS
        # ----------------------------------------------------

        for row in rows:

            if isinstance(
                row,
                dict
            ):

                values = [
                    row.get(
                        column,
                        ""
                    )
                    for column in columns
                ]

            else:

                values = list(row)

            row_data = []

            for index in range(
                len(columns)
            ):

                value = (
                    values[index]
                    if index < len(values)
                    else ""
                )

                row_data.append(
                    Paragraph(
                        self.escape_text(
                            value
                        ),
                        self.small_style
                    )
                )

            table_data.append(
                row_data
            )

        # ----------------------------------------------------
        # TABLE
        # ----------------------------------------------------

        table = Table(
            table_data,
            repeatRows=1,
            hAlign="LEFT"
        )

        table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.black
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.lightgrey
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        5
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        4
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        4
                    )
                ]
            )
        )

        elements.append(
            table
        )

        elements.append(
            Spacer(
                1,
                10
            )
        )

        return elements

    # ========================================================
    # DICTIONARY
    # ========================================================

    def render_dict(
        self,
        data,
        level=2
    ):

        elements = []

        for key, value in data.items():

            if key == "formatting":
                continue

            # Nested dictionary
            if isinstance(
                value,
                dict
            ):

                elements.append(
                    Paragraph(
                        self.escape_text(
                            humanize_key(key)
                        ),
                        self.subheading_style
                    )
                )

                elements.extend(
                    self.render_dict(
                        value,
                        level + 1
                    )
                )

            # List
            elif isinstance(
                value,
                list
            ):

                elements.extend(
                    self.render_list(
                        key,
                        value,
                        level
                    )
                )

            # Primitive
            else:

                text = (
                    f"<b>"
                    f"{self.escape_text(humanize_key(key))}"
                    f":</b> "
                    f"{self.escape_text(value)}"
                )

                elements.append(
                    Paragraph(
                        text,
                        self.body_style
                    )
                )

        return elements

    # ========================================================
    # LIST
    # ========================================================

    def render_list(
        self,
        title,
        items,
        level=2
    ):

        elements = []

        if not items:
            return elements

        # ----------------------------------------------------
        # LIST OF DICTIONARIES
        # ----------------------------------------------------

        if all(
            isinstance(
                item,
                dict
            )
            for item in items
        ):

            flat = all(
                all(
                    not isinstance(
                        value,
                        (dict, list)
                    )
                    for value in item.values()
                )
                for item in items
            )

            if flat:

                columns = []

                for item in items:

                    for key in item:

                        if key not in columns:

                            columns.append(
                                key
                            )

                return self.make_table(
                    columns,
                    items,
                    title
                )

        # ----------------------------------------------------
        # BULLET LIST
        # ----------------------------------------------------

        elements.append(
            Paragraph(
                self.escape_text(
                    humanize_key(title)
                ),
                self.subheading_style
            )
        )

        list_items = []

        for item in items:

            if isinstance(
                item,
                (dict, list)
            ):

                nested = (
                    self.render_dict(
                        item,
                        level + 1
                    )
                )

                for element in nested:

                    list_items.append(
                        ListItem(
                            element
                        )
                    )

            else:

                list_items.append(
                    ListItem(
                        self.paragraph(
                            item
                        )
                    )
                )

        if list_items:

            elements.append(
                ListFlowable(
                    list_items,
                    bulletType="bullet",
                    leftIndent=18
                )
            )

            elements.append(
                Spacer(
                    1,
                    6
                )
            )

        return elements

    # ========================================================
    # SECTIONS
    # ========================================================

    def render_sections(
        self,
        sections
    ):

        elements = []

        for section in sections:

            if not isinstance(
                section,
                dict
            ):
                continue

            title = (
                section.get(
                    "section_title"
                )
                or section.get(
                    "title"
                )
                or section.get(
                    "name"
                )
            )

            if title:

                elements.append(
                    Paragraph(
                        self.escape_text(
                            title
                        ),
                        self.heading_style
                    )
                )

            content = section.get(
                "content"
            )

            if isinstance(
                content,
                dict
            ):

                elements.extend(
                    self.render_dict(
                        content,
                        2
                    )
                )

            elif isinstance(
                content,
                list
            ):

                elements.extend(
                    self.render_list(
                        "Content",
                        content,
                        2
                    )
                )

            elif content is not None:

                elements.append(
                    self.paragraph(
                        content
                    )
                )

        return elements

    # ========================================================
    # TABLES
    # ========================================================

    def render_tables(
        self,
        tables
    ):

        elements = []

        for table in tables:

            if not isinstance(
                table,
                dict
            ):
                continue

            columns = (
                table.get(
                    "columns"
                )
                or table.get(
                    "headers"
                )
                or []
            )

            rows = (
                table.get(
                    "rows"
                )
                or table.get(
                    "data"
                )
                or []
            )

            title = (
                table.get(
                    "table_title"
                )
                or table.get(
                    "title"
                )
                or table.get(
                    "name"
                )
            )

            elements.extend(
                self.make_table(
                    columns,
                    rows,
                    title
                )
            )

        return elements

    # ========================================================
    # METADATA
    # ========================================================

    def render_metadata(
        self
    ):

        elements = []

        metadata = self.data.get(
            "metadata",
            {}
        )

        if not isinstance(
            metadata,
            dict
        ):
            return elements

        title = metadata.get(
            "title"
        )

        if title:

            elements.append(
                Paragraph(
                    self.escape_text(
                        title
                    ),
                    self.title_style
                )
            )

        metadata_rows = []

        for key, value in metadata.items():

            if key == "title":
                continue

            if isinstance(
                value,
                (dict, list)
            ):
                continue

            metadata_rows.append(
                [
                    Paragraph(
                        self.escape_text(
                            humanize_key(
                                key
                            )
                        ),
                        self.small_style
                    ),
                    Paragraph(
                        self.escape_text(
                            value
                        ),
                        self.small_style
                    )
                ]
            )

        if metadata_rows:

            table = Table(
                metadata_rows,
                colWidths=[
                    45 * mm,
                    120 * mm
                ]
            )

            table.setStyle(
                TableStyle(
                    [
                        (
                            "GRID",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.grey
                        ),
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "MIDDLE"
                        ),
                        (
                            "LEFTPADDING",
                            (0, 0),
                            (-1, -1),
                            5
                        ),
                        (
                            "RIGHTPADDING",
                            (0, 0),
                            (-1, -1),
                            5
                        )
                    ]
                )
            )

            elements.append(
                table
            )

            elements.append(
                Spacer(
                    1,
                    10
                )
            )

        return elements

    # ========================================================
    # MAIN RENDER
    # ========================================================

    def render(self):

        elements = []

        # Metadata / title
        elements.extend(
            self.render_metadata()
        )

        content = self.data.get(
            "content",
            {}
        )

        if isinstance(
            content,
            dict
        ):

            # Sections
            if "sections" in content:

                elements.extend(
                    self.render_sections(
                        content["sections"]
                    )
                )

            # Tables
            if "tables" in content:

                elements.extend(
                    self.render_tables(
                        content["tables"]
                    )
                )

            # Remaining dynamic content
            for key, value in content.items():

                if key in {
                    "sections",
                    "tables",
                    "formatting"
                }:
                    continue

                if isinstance(
                    value,
                    dict
                ):

                    elements.append(
                        Paragraph(
                            self.escape_text(
                                humanize_key(key)
                            ),
                            self.heading_style
                        )
                    )

                    elements.extend(
                        self.render_dict(
                            value,
                            2
                        )
                    )

                elif isinstance(
                    value,
                    list
                ):

                    elements.extend(
                        self.render_list(
                            key,
                            value,
                            1
                        )
                    )

                else:

                    elements.append(
                        self.paragraph(
                            f"{humanize_key(key)}: "
                            f"{format_value(value)}"
                        )
                    )

        elif isinstance(
            content,
            list
        ):

            elements.extend(
                self.render_list(
                    "Content",
                    content,
                    1
                )
            )

        elif content is not None:

            elements.append(
                self.paragraph(
                    content
                )
            )

        return elements

    # ========================================================
    # SAVE
    # ========================================================

    def save(self):

        self.output_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        document = SimpleDocTemplate(
            str(self.output_path),
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=18 * mm,
            bottomMargin=18 * mm
        )

        elements = self.render()

        document.build(
            elements
        )

        return self.output_path


# ============================================================
# PUBLIC FUNCTIONS
# ============================================================

def load_json(
    json_path
):

    with open(
        json_path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def generate_pdf_from_json(
    json_path,
    output_path=None
):

    data = load_json(
        json_path
    )

    if output_path is None:

        base_dir = (
            Path(json_path).parent.parent
        )

        output_dir = (
            base_dir / "pdf_output"
        )

        output_dir.mkdir(
            exist_ok=True
        )

        name = safe_filename(
            data.get(
                "document_name",
                Path(json_path).stem
            )
        )

        output_path = (
            output_dir
            / f"{name}.pdf"
        )

    generator = (
        AdaptivePDFGenerator(
            data,
            output_path
        )
    )

    return generator.save()