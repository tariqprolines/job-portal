import React, { useState, useEffect } from "react";
import { ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchPreviewData } from '../store/slices/previewSlice';
import { AppDispatch, RootState } from '../store/store';

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Chapter {
  CourseTitle: string;
  ChapterTitle: string;
  description: string;
  quiz?: Quiz[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface Program {
  title: string;
  overview: string;
  courses: Course[];
}

const PreviewComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const slugId = queryParams.get('slugid') || '';
  const pathname = location.pathname;



  const userData = useSelector((state: RootState) => state.auth.data);
  const [program, setProgram] = useState<Program | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      const payload = { userid: userData?.user_id, slugid: slugId };

      try {
        const response = await dispatch(fetchPreviewData(payload));
        if (fetchPreviewData.fulfilled.match(response)) {
          const programData = JSON.parse(response.payload.programdetail || "[]");
          const courseData = JSON.parse(response.payload.coursedetail || "[]");
          const chapterData = JSON.parse(response.payload.chapterdetail || "[]");

          // Organizing chapters under their respective courses
          const coursesWithChapters = courseData.map((course: Course) => ({
            ...course,
            chapters: chapterData.filter((chapter: Chapter) => chapter.CourseTitle === course.title), // Match chapters to course
          }));

          setProgram({
            title: programData.length > 0 ? programData[0].title : "No Title",
            overview: programData.length > 0 ? programData[0].description : "No Description",
            courses: Array.isArray(coursesWithChapters) ? coursesWithChapters : [],
          });

          console.log("Final Program Data:", coursesWithChapters);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, userData?.user_id, slugId, pathname]);


  const [isActive, setIsActive] = useState(false);
  const togglePopup = () => setIsActive(!isActive);
  const closePopup = () => {
    setIsActive(false);
  };
  return (
    <>
      {program?.title && program.title.trim().length > 0 && pathname !== '/preview-and-submit' && (
        <button className="fixed top-1/2 right-[-0.63rem] bg-blue-600 text-white px-4 py-2 rotate-[-90deg]" onClick={togglePopup}>
          Preview
        </button>
      )}

      {isActive && <div className="fixed inset-0 bg-black opacity-50" onClick={closePopup}></div>}
      <div className={`fixed top-0 right-0 w-96 bg-white h-screen z-50 p-5 pr-0 shadow-lg transform ${isActive ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <div className="flex-1 overflow-y-auto">
          <div className="border-b pb-2 ">
            <h3 className="text-xl font-medium ">Final Content</h3>
            <p className="text-base font-normal text-[#808080] mb-1 mt-1">You can change all information in preview mode.</p>
            <button type="button" className="absolute right-[1rem] top-[1rem] text-xl bg-transparent" onClick={closePopup}>X</button>
          </div>
          <div className="mt-4 min-h-[70vh] max-h-[90vh] overflow-x-auto pr-[20px]">
            {/* Content */}
            <div className="mb-4">
              {/* Your content here */}
              <h3 className="text-[18px] text-[#262626] font-normal mb-4"><b className=" font-medium">Program Title:</b> {program?.title}</h3>
              <p className="text-[#000000] mb-4 font-normal"><b className=" font-medium">Overview:</b> {program?.overview}</p>
              {Array.isArray(program?.courses) && program.courses.length > 0 && (
                <h2 className="text-xl font-medium mb-2">Courses:</h2>
              )}

              {program?.courses?.map((course) => (
                <div key={course.id} className="bg-white p-6 mb-6">
                  <h3 className="text-xl font-medium mb-2">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                  {course?.chapters?.map((chapter, index) => (
                    <div key={index} className="bg-blue-50 p-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{chapter.ChapterTitle}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-gray-700 mb-4">{chapter.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4 mr-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-colors min-w-27 w-full sm:w-auto border border-[#0057BF] bg-[#0057BF] hover:bg-[#1d4ed8]">Save</button>
            <button type="button" className="min-w-25 px-4 py-1 ml-5 text-[#0057BF] border border-[#0057BF] rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto" onClick={closePopup}>Cancel</button>

          </div>

        </div>




      </div>


    </>
  );
};

export default PreviewComponent;
