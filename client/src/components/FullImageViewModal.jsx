import React from "react";
import { X } from "lucide-react";

const FullImageViewModal = ({ src, alt, setShowFullImageViewModal }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-5 animate-fadeIn z-50"
      onClick={() => setShowFullImageViewModal(false)}
    >
      <div
        className="relative cursor-auto"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking image container
      >
        <img
          src={src}
          alt={alt}
          className="w-full max-w-3xl max-h-[90vh] object-contain rounded-md animate-scaleUp"
        />

        <button
          onClick={() => setShowFullImageViewModal(false)}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FullImageViewModal;
