export const getDynamicRedirect = (courseData: Record<string, any>): string => {
    // Define the sequence of keys and their respective routes
    const keysWithRoutes: { key: string; route: string }[] = [
        { key: "programdetail", route: "/course-structure" },
        { key: "coursedetail", route: "/create-course" },
        { key: "chapterdetail", route: "/chapters-outline" },
        { key: "pptdetail", route: "/chapters-ppt" },
        { key: "quizdetail", route: "/quiz-outline" },
    ];

    let lastValidRoute: string | null = null;

    for (const { key, route } of keysWithRoutes) {
        if (!courseData[key]) {
            // If "programdetail" is missing, force redirect to "/course-structure"
            return key === "programdetail" ? "/course-structure" : lastValidRoute || "/course-structure";
        }
        lastValidRoute = route;
    }

    return lastValidRoute || "/course-structure"; // Default to "/course-structure" if no route found
};
