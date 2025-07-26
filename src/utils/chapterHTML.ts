interface Chapter {
    id: number;
    title: string;
}

interface Course {
    id: number;
    title: string;
    chapters: Chapter[];
}

interface CourseData {
    heading: string;
    courses: Course[];
}

export const chapterHTMLToJSON = (html: string): CourseData => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const headingElement = tempDiv.querySelector("p");
    const heading = headingElement ? headingElement.textContent?.trim() || "" : "";

    const courses: Course[] = [];
    const chapterTitles: Set<string> = new Set(); // To track unique chapter titles
    let courseId = 1;

    const olElements = Array.from(tempDiv.querySelectorAll("ol"));
    const hasNestedCourses = olElements.some((ol) =>
        ol.querySelector(":scope > li > ol")
    );

    if (hasNestedCourses) {
        olElements.forEach((ol) => {
            const parentLiElements = Array.from(ol.children).filter(
                (node) => node.tagName === "LI"
            ) as HTMLLIElement[];

            parentLiElements.forEach((li) => {
                const nestedOl = li.querySelector(":scope > ol");
                const titleNode = li.querySelector("b") || li.childNodes[0];

                if (nestedOl && titleNode) {
                    let courseTitle = titleNode.textContent?.trim() || "";
                    courseTitle = courseTitle.replace(/\*\*/g, ""); // Remove Markdown-style bold

                    const chapters: Chapter[] = Array.from(nestedOl.querySelectorAll(":scope > li"))
                        .map((chapterLi, idx) => {
                            const chapterTitle = chapterLi.textContent?.trim() || "";
                            if (!chapterTitles.has(chapterTitle)) {
                                chapterTitles.add(chapterTitle);
                                return { id: idx + 1, title: chapterTitle };
                            }
                            return null; // Avoid adding duplicate chapters
                        })
                        .filter((chapter) => chapter !== null) as Chapter[];

                    if (chapters.length > 0) {
                        courses.push({
                            id: courseId++,
                            title: courseTitle,
                            chapters,
                        });
                    }
                }
            });
        });
    } else {
        olElements.forEach((ol) => {
            let chapterId = 1;
            const chapters: Chapter[] = [];

            const prevSibling = ol.previousElementSibling;
            let courseTitle = prevSibling && prevSibling.tagName === "P" ? prevSibling.textContent?.trim() || "" : "";

            ol.querySelectorAll(":scope > li").forEach((li) => {
                const chapterTitle = li.textContent?.trim() || "";
                if (!chapterTitles.has(chapterTitle)) {
                    chapterTitles.add(chapterTitle);
                    chapters.push({ id: chapterId++, title: chapterTitle });
                }
            });

            if (chapters.length > 0) {
                courses.push({
                    id: courseId++,
                    title: courseTitle || "",
                    chapters,
                });
            }
        });
    }

    // Handle <ul> and <b> for course titles
    const ulElements = Array.from(tempDiv.querySelectorAll("ul > li"));
    ulElements.forEach((li) => {
        const titleNode = li.querySelector("b");
        if (titleNode) {
            const courseTitle = titleNode.textContent?.trim() || "";
            const nestedOl = li.querySelector("ol");

            if (nestedOl) {
                const chapters: Chapter[] = Array.from(nestedOl.querySelectorAll(":scope > li")).map(
                    (chapterLi, idx) => {
                        const chapterTitle = chapterLi.textContent?.trim() || "";
                        if (!chapterTitles.has(chapterTitle)) {
                            chapterTitles.add(chapterTitle);
                            return { id: idx + 1, title: chapterTitle };
                        }
                        return null; // Avoid adding duplicate chapters
                    }
                ).filter((chapter) => chapter !== null) as Chapter[];

                if (chapters.length > 0) {
                    courses.push({
                        id: courseId++,
                        title: courseTitle,
                        chapters,
                    });
                }
            }
        }
    });

    return { heading, courses };
};


