// utils/parseHTML.ts

export interface ListItem {
    title: string;
    description: string;
}

export interface ParsedHTML {
    title: string;
    listItems: ListItem[];
    aidescriptions: string[];
}

// Utility function to parse HTML content
export const parseHTML = (html: string): ParsedHTML => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Extract title (first <p> tag)
    const title: string = tempDiv.querySelector("p")?.textContent?.trim() ?? "";

    // Extract ordered and unordered list items
    const listItems: ListItem[] = Array.from(tempDiv.querySelectorAll("ol li, ul li")).map((item) => {
        const rawText = item.textContent?.trim() || "";
        const cleanedTitle = rawText.replace(/^"|"$/g, ""); // Remove surrounding quotes if present
        return {
            title: cleanedTitle,
            description: "", // No separate description available
        };
    });

    // Extract descriptions (p, h2, h3) appearing **after** the last <ol> or <ul>
    const lists = tempDiv.querySelectorAll("ol, ul");
    const lastList = lists[lists.length - 1]; // Get last list element

    let aidescriptions: string[] = [];
    if (lastList) {
        let nextElement: Element | null = lastList.nextElementSibling;
        while (nextElement) {
            if (["P", "H2", "H3"].includes(nextElement.tagName)) {
                const text = nextElement.textContent?.trim() ?? ""; // Ensure textContent is not null
                if (text) aidescriptions.push(text.replace(/^"|"$/g, "")); // Remove surrounding quotes if present
            }
            nextElement = nextElement.nextElementSibling;
        }
    }

    return { title, listItems, aidescriptions };
};




// utils/parseHTML.ts

// export interface ListItem {
//     title: string;
//     description: string;
// }

// export interface ParsedHTML {
//     title: string;
//     listItems: ListItem[];
//     aidescriptions: string[];
// }

// // Utility function to parse HTML content
// export const parseHTML = (html: string): ParsedHTML => {
//     const tempDiv = document.createElement("div");
//     tempDiv.innerHTML = html;

//     // Extract the main title from the first <p> tag
//     let title: string = tempDiv.querySelector("p")?.textContent ?? "";

//     // Remove any content starting from the first numbered list (e.g., "1. ")
//     const listIndex = title.indexOf("1.");
//     if (listIndex !== -1) {
//         title = title.slice(0, listIndex).trim();
//     }

//     // Extract ordered list items (the numbered list inside the <p> tag)
//     const listItems: ListItem[] = [];

//     // Modify the regex pattern to capture the correct items with their titles and descriptions
//     const listItemPattern = /(\d+)\.\s*<strong>"([^"]+)"<\/strong>\s*-\s*([^<]+)(?=<\/p>|\d+\.|$)/g;

//     // Run the regex over the entire HTML string to extract all list items
//     let match;
//     while ((match = listItemPattern.exec(html)) !== null) {
//         // Extract the title and description from the match
//         const listTitle = match[2].trim();
//         const description = match[3].trim();

//         // Push the list item into the array
//         listItems.push({
//             title: listTitle || "No title", // fallback for empty titles
//             description: description || "No description", // fallback for empty descriptions
//         });
//     }

//     // Extract descriptions (p, h2, h3) appearing after the list items
//     let aidescriptions: string[] = [];
//     let nextElement: Element | null = tempDiv.querySelector("p")?.nextElementSibling as Element | null;

//     // Check for undefined and ensure we only handle `Element | null`
//     while (nextElement) {
//         if (["P", "H2", "H3"].includes(nextElement.tagName)) {
//             const text = nextElement.textContent?.trim() ?? ""; // Ensure textContent is not null
//             if (text) aidescriptions.push(text);
//         }
//         // Only move to the next sibling if the current one is valid (non-undefined)
//         nextElement = nextElement.nextElementSibling as Element | null;
//     }

//     return { title, listItems, aidescriptions };
// };
