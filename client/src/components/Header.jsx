import React, { useEffect, useRef, useState } from "react";
import HamburgerMenu from "./HamburgerMenu";
import { navLinks } from "../utils/constant";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import useAuthStore from "../stores/authStore";
import ProfileModal from "../components/ProfileModal";

const Header = ({ active }) => {
  const { authUser } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const profileModalRef = useRef(null);
  const profileImgRef = useRef(null);

  const handleMouseDown = (e) => {
    if (
      profileImgRef.current &&
      profileModalRef.current &&
      !profileModalRef.current.contains(e.target) &&
      !profileImgRef.current.contains(e.target)
    ) {
      setShowProfileModal((prev) => !prev);
    }
  };

  return (
    <header className="w-full border-b">
      <nav className="w-full max-w-[72rem] py-4 px-6 mx-auto flex flex-wrap gap-4 justify-between items-center lg:px-10">
        <Link to="/" className="flex gap-1 items-center">
          <img
            src="/assets/images/logo.png"
            alt="Logo Icon"
            className="w-12"
          />
          <h3 className="text-xl font-semibold capitalize tracking-tight text-primary-500">
            Campus Connect
          </h3>
        </Link>

        <ul className="hidden gap-4 capitalize text-[0.95rem] md:flex">
          {navLinks.map((link) => (
            <li key={link.id}>
              <Link
                to={`${link.path}`}
                className={`relative group text-black transition duration-200 ${
                  link.label.toLowerCase() === active ? "text-primary-500" : ""
                } hover:text-primary-500`}
              >
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-primary-500 transition-all duration-300 ${
                    link.label.toLowerCase() === active
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                ></span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative flex gap-2.5 items-center">
          <div className="flex items-center md:hidden">
            <HamburgerMenu active={active} />
          </div>
          {!authUser && (
            <Link to="/login">
              <Button
                type="submit"
                size="sm"
                className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition duration-200"
              >
                Login
              </Button>
            </Link>
          )}
          {authUser && (
            <button onClick={() => setShowProfileModal((prev) => !prev)}>
              <img
                ref={profileImgRef}
                src={authUser.profileImageUrl || "/assets/images/avatar.png"}
                alt="Profile Pic"
                className="size-10 border-[1px] border-primary-500 rounded-full object-cover cursor-pointer"
              />
            </button>
          )}
          {showProfileModal && (
            <ProfileModal
              profileModalRef={profileModalRef}
              handleMouseDown={handleMouseDown}
              setShowProfileModal={setShowProfileModal}
            />
          )}
        </div>
      </nav>
      {/* <div className="w-full flex justify-center py-2 bg-primary-500">
        <h4 className="text-white">This website is under development! 🚀</h4>
      </div> */}
    </header>
  );
};

export default Header;
