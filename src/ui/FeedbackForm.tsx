import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { feedback } from "../store/slices/userSlice";
import { AppDispatch, RootState } from "../store/store";
import { useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';

const FeedbackComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isActive, setIsActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("No Files Chosen");
  const [attachmentError, setAttachmentError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const pathname = location.pathname;
  const userData = useSelector((state: RootState) => state.auth);
  

  const togglePopup = () => setIsActive(!isActive);
  const closePopup = () => {
    setIsActive(false);
    setRating(null);
    setComments("");
    setAttachment(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setAttachmentName("No Files Chosen");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;   
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validImageTypes.includes(file.type)) {
        setAttachmentError("Please upload a valid image file (JPEG, PNG, GIF, WEBP).")
        setAttachment(null);
        setAttachmentName("No Files Chosen");
      } else {
        setAttachmentError("");
        setAttachment(file);
        setAttachmentName(file.name);
      }
    } else {
      setAttachment(null);
      setAttachmentName("No Files Chosen");
    }
  };

  const submitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  
    if (!rating || attachmentError) return;
  
    // Create FormData object
    const currentTimestamp = Date.now();
    const created_date = currentTimestamp.toString();;
    const formData = new FormData();
    formData.append("user_id", userData?.data?.user_id || "");
    formData.append("name", userData?.data?.name || "");
    formData.append("email", userData?.data?.email || "");
    formData.append("rating", rating.toString());
    formData.append("comments", comments);
    formData.append("created_date", created_date);
  
    if (attachment) {
      formData.append("attachment", attachment, attachment.name); 
    }
  
    // Debugging output
    console.log("Form Data Entries:", [...formData.entries()]);
  
    try {
      const response = await dispatch(feedback(formData));
  
      if (response) {
        toast.success("Feedback submitted successfully!");
        closePopup();
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    }
  };
  
  
  return (
    <>
    {pathname !== '/preview-and-submit' && (
      <button className="fixed top-[30%] right-[-1.13rem] bg-blue-600 text-white px-4 py-2 rotate-[-90deg]" onClick={togglePopup}>
        Feedback
      </button>
    )} 
      {isActive && <div className="fixed inset-0 bg-black opacity-50" onClick={closePopup}></div>}
      <div className={`fixed top-0 right-0 w-96 bg-white max-h-screen overflow-x-auto z-50 p-5 shadow-lg transform ${isActive ? "translate-x-0" : "translate-x-full"} transition-transform`}>
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xl font-medium border-b pb-2 ">We want your Feedback</h3>
        <button type="button" className="absolute right-[1rem] top-[1rem] text-xl bg-transparent" onClick={closePopup}>X</button>
        <form onSubmit={submitHandler} className="mt-4">
          <label className="block mb-2 ">How satisfied are you with AI Assistant?<span className="text-red-500 ml-1">*</span></label>
          <div className="flex space-x-2">
            {[1,2,3,4,5].map((star) => (
              <button type="button" key={star} className={`text-2xl ${rating && rating >= star ? "text-yellow-500" : "text-gray-300"}`} onClick={() => setRating(star)}>
                ★
              </button>
            ))}
          </div>
          {submitted && !rating && <p className="text-red-500 text-sm">Please select a rating.</p>}

          <label className="block mt-4">Describe your feedback (Please don’t include any sensitive information)</label>
          <textarea className="w-full p-2 border rounded resize-none min-h-40" placeholder="Describe your feedback, Send feedback to Onsumaye AI." value={comments} onChange={(e) => setComments(e.target.value)}></textarea>

          <label className="block mt-4">Attachment (Optional)</label>
          <p className="text-base font-normal text-[#808080] mb-1 mt-1">A screenshot will help us better understand your feedback.</p>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <div className="flex items-center space-x-2 border p-2 rounded cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <span className="bg-gray-700 text-white px-4 py-1">Choose File</span>
            <span className="font-normal text-[#808080]">{attachmentName}</span>
          </div>
          {attachmentError && <p className="text-red-500 text-sm">{attachmentError}</p>}

       
          <div className="flex justify-end mt-4 mr-6">

            <button type="button" className="min-w-25 px-4 py-1 mr-5 text-[#0057BF] border border-[#0057BF] rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto" onClick={closePopup}>Cancel</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-lg transition-colors min-w-27 w-full sm:w-auto border border-[#0057BF] bg-[#0057BF] hover:bg-[#1d4ed8]">Submit</button>
          </div>


        </form>
      </div>
      </div>
    </>
  );
};

export default FeedbackComponent;
