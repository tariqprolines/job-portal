interface Course {
  id: number;
  title: string;
  description?: string;
}

interface Group {
  id: number;
  title: string;
  courses: Course[];
}

interface ParsedData {
  heading: string;  // Added heading to the returned data
  groups: Group[];
}

export const parseHTMLToJSON = (html: string): ParsedData => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const groups: Group[] = [];
  let groupId = 1;

  // Select all <ol> elements
  const olElements = Array.from(tempDiv.querySelectorAll("ol"));

  // Check for <p> element to use as heading
  const headingParagraph = tempDiv.querySelector("p");

  // If a <p> exists, use it as the heading for the courses
  const heading = headingParagraph ? headingParagraph.textContent?.trim() || "" : "";

  // Case 1: Check for Nested <ol> inside <li> (Grouped Format)
  const hasNestedGroups = olElements.some((ol) =>
    Array.from(ol.children).some((li) => li.querySelector("ol"))
  );

  // Case 2: Check for Course Descriptions (Detailed Format)
  const hasDescriptions = Array.from(tempDiv.querySelectorAll("p")).some((p) =>
    p.querySelector("strong")
  );

  if (hasNestedGroups) {
    // Handle Grouped Format
    olElements.forEach((ol) => {
      const parentLiElements = Array.from(ol.children).filter(
        (node) => node.tagName === "LI"
      ) as HTMLLIElement[];

      parentLiElements.forEach((li) => {
        const nestedOl = li.querySelector(":scope > ol");
        const titleNode = li.querySelector("b") || li.firstChild;

        if (nestedOl && titleNode) {
          let groupTitle = titleNode.textContent?.trim() || "";
          groupTitle = groupTitle.replace(/\*\*/g, ""); // Remove Markdown-style bold

          const courses: Course[] = Array.from(nestedOl.querySelectorAll("li")).map(
            (courseLi, idx) => ({
              id: idx + 1,
              title: courseLi.textContent?.trim() || "",
            })
          );

          groups.push({
            id: groupId++,
            title: heading || groupTitle, // Use the <p> heading if available, otherwise use the group title
            courses,
          });
        }
      });
    });
  } else if (hasDescriptions) {
    // Handle Detailed Courses with Descriptions (Third Format)
    const descriptionParagraphs = Array.from(tempDiv.querySelectorAll("p"));
    descriptionParagraphs.forEach((p) => {
      const strong = p.querySelector("strong");
      if (strong && strong.textContent?.includes("Next-Gen RAN Security Courses")) {
        const courses: Course[] = Array.from(p.nextElementSibling?.querySelectorAll("ol > li") || []).map(
          (courseLi, idx) => ({
            id: idx + 1,
            title: courseLi.textContent?.trim() || "",
            description: courseLi.textContent?.split(":")[1]?.trim() || "",
          })
        );

        groups.push({
          id: groupId++,
          title: heading || "Next-Gen RAN Security Courses", // Use <p> heading if available, else use static title
          courses,
        });
      }
    });
  } else {
    // Handle Flat Format
    olElements.forEach((ol, index) => {
      const courses: Course[] = Array.from(ol.querySelectorAll(":scope > li")).map(
        (li, idx) => ({
          id: idx + 1,
          title: li.textContent?.trim() || "",
        })
      );

      groups.push({
        id: groupId++,
        title: heading || `Category ${index + 1}`, // Use <p> heading if available, else use generic titles
        courses,
      });
    });
  }

  return { heading, groups };  // Return both heading and groups
};



// <ol>
//   <li>Foundational Courses
//     <ul>
//       <li>Mastering Advanced RAN Configuration: Boosting Network Efficiency</li>
//       <li>Essentials of RAN Management: A Beginner's Guide to 5G Networks</li>
//       <li>RAN Fundamentals: Building a Strong Foundation for Advanced Networks</li>
//     </ul>
//   </li>
//   <li>Intermediate Courses
//     <ul>
//       <li>Advanced RAN Configuration and Optimization Techniques</li>
//       <li>RAN Performance Management: Troubleshooting and Analysis</li>
//       <li>RAN Security and Compliance: Protecting Next-Generation Networks</li>
//     </ul>
//   </li>
//   <li>Advanced Courses
//     <ul>
//       <li>Expert-Level RAN Configuration and Management for 5G and Beyond</li>
//       <li>Advanced RAN Architecture and Design: Future-Proofing Your Network</li>
//       <li>RAN Automation and Orchestration: Streamlining Network Operations</li>
//     </ul>
//   </li>
// </ol>

// <ol>
//   <li>Network Slicing Fundamentals in 5G Environments</li>
//   <li>5G Network Slicing for Enhanced User Experience</li>
//   <li>RAN Network Slicing: Key to Unlocking 5G Potential</li>
// </ol>
// <ol>
//   <li>Optimizing RAN Environments with Network Slicing Techniques</li>
//   <li>Network Slicing in RAN: A Deep Dive into 5G Architecture</li>
//   <li>Enhancing RAN Capacity with Intelligent Network Slicing</li>
// </ol>
// <ol>
//   <li>5G RAN Network Slicing: Challenges and Opportunities</li>
//   <li>Network Slicing Strategies for Next-Gen RAN Environments</li>
//   <li>RAN Network Slicing: The Future of 5G Network Architecture</li>
// </ol>


// <p><strong>Next-Gen RAN Security Courses</strong>
// Description: Enhance your knowledge of next-generation Radio Access Network (RAN) security with these specialized courses, focusing on AI-driven security, zero trust architecture, and Secure Access Service Edge (SASE) integration.</p><ol><li>**AI-Driven Next-Gen RAN Security**: This course delves into leveraging machine learning for threat mitigation in next-gen RAN.It covers the fundamentals of AI in security,
// machine learning algorithms for threat detection,
// and the implementation of AI-driven security solutions.Students will learn how to analyze threats,
// develop predictive models,
// and integrate AI into existing security frameworks to enhance the security posture of next-gen RAN.The course also explores the benefits and challenges of AI in security and provides hands-on experience with AI-driven security tools.</li>
//   <li>**Zero Trust Architecture for Next-Gen RAN**: This course focuses on the implementation and management of zero trust architecture in next-gen RAN. It covers the principles of zero trust, identity-based security, and micro-segmentation. Students will learn how to design and implement zero trust architectures, configure trust zones, and manage access control. The course also explores the role of zero trust in next-gen RAN security, its benefits, and challenges, and provides hands-on experience with zero trust implementation and management.</li><li>**Secure Access Service Edge(SASE)for Next-Gen RAN**: This course explores the integration and benefits of SASE in next-gen RAN.It covers the fundamentals of SASE,
// its components,
// and its role in next-gen RAN security.Students will learn how to integrate SASE with existing security frameworks,
// configure SASE components,
// and manage SASE-based security solutions.The course also explores the benefits of SASE,
// including improved security,
// reduced latency,
// and increased scalability,
// and provides hands-on experience with SASE implementation and management.</li>
// </ol>


// <p>Unlock the full potential of Radio Access Network Planning and Design with our expert-led courses, designed to elevate your skills and knowledge in this critical field.</p>

// <p><strong><strong>Foundational Courses</strong></strong></p>
// <ol>
//   <li><strong>Radio Access Network Fundamentals</strong></li>
//   <li><strong>Network Planning and Design Essentials</strong></li>
//   <li><strong>Introduction to RAN Architecture</strong></li>
// </ol>

// <p><strong><strong>Advanced Planning and Optimization</strong></strong></p>
// <ol>
//   <li><strong>Optimizing RAN Performance and Capacity</strong></li>
//   <li><strong>Advanced Network Planning Strategies</strong></li>
//   <li><strong>RAN Design for 5G Networks</strong></li>
// </ol>

// <p><strong><strong>Specialized Topics and Technologies</strong></strong></p>
// <ol>
//   <li><strong>O-RAN and Virtualized RAN Solutions</strong></li>
//   <li><strong>Radio Access Network Security and Management</strong></li>
//   <li><strong>Emerging Trends in RAN Technology</strong></li>
// </ol>