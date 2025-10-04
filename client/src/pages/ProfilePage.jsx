import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import useProfileStore from "../stores/profileStore";
import { Link } from "react-router-dom";
import UpdateProfileModal from "../components/UpdateProfileModal";
import { Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { profileData, getProfile, isProfileFetched } = useProfileStore();

  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);

  const fetchProfile = async () => {
    await getProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleClick = () => {
    setShowUpdateProfileModal(false);
  };

  return (
    <>
      <Header active="profile" />
      <main>
        <section className="w-full max-w-[72rem] py-8 px-6 mx-auto lg:px-10">
          <div className="bg-primary-50 rounded-md shadow-md border-[1px] min-h-[65vh]">
            {isProfileFetched ? (
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-2 px-6 pt-6 pb-0 md:py-6 flex flex-col gap-6">
                  <div className="flex flex-col items-start sm:items-center gap-3 justify-between sm:flex-row sm:gap-5 border p-3 rounded">
                    <div className="flex flex-col gap-3 items-start sm:items-center sm:flex-row">
                      <div>
                        <img
                          className="w-20 h-20 object-cover rounded-full border-[1px] border-primary-300"
                          src={
                            profileData.profileImageUrl ||
                            "../assets/images/avatar.png"
                          }
                          alt="Profile"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-primary-500">
                          Name: {profileData.name}
                        </h3>
                        <p className="text-[0.9rem]">
                          Email: {profileData.email}
                        </p>
                        <p className="text-[0.85rem]">
                          Department: {profileData.department}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setShowUpdateProfileModal(true)}
                        className="bg-primary-500 text-white hover:bg-primary-300 uppercase text-[0.9rem] font-semibold px-3 py-1.5 rounded-md"
                      >
                        EDIT
                      </button>
                    </div>
                  </div>
                  {profileData.role === "student" ? (
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-primary-500 font-semibold">
                        Attended Events
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {profileData.attendedEvents?.length ? (
                          profileData.attendedEvents.map((event) => (
                            <li key={event.titleSlug}>
                              <Link
                                to={`/events/${event._id}`}
                                className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-3 border p-2.5 rounded"
                              >
                                <div className="col-span-3 custom-lg:col-span-2">
                                  <img
                                    className="w-full aspect-square rounded-full object-cover"
                                    src={
                                      event.eventImageUrl ||
                                      "../assets/images/image_avatar.jpg"
                                    }
                                    alt="Event"
                                  />
                                </div>
                                <div className="col-span-13 custom-lg:col-span-14 flex flex-col gap-0.5">
                                  <div className="flex flex-col items-start justify-between sm:flex-row">
                                    <h3 className="text-[0.85rem] text-neutral-800 font-semibold sm:text-base">
                                      {event.title}
                                    </h3>
                                    <h6 className="text-[0.7rem]">
                                      {event.date}
                                    </h6>
                                  </div>
                                  <p className="hidden text-gray-500 text-[0.8rem] leading-4 sm:block">
                                    {event.description.slice(0, 80) + "..."}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li className="text-[0.825rem] text-neutral-700 capitalize">
                            No Events Attended Yet!
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-primary-500 font-semibold">
                        Hosted Events
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {profileData.events?.length ? (
                          profileData.events.map((event) => (
                            <li key={event.titleSlug}>
                              <Link
                                to={`/events/${event._id}`}
                                className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-3 border p-2.5 rounded items-center"
                              >
                                <div className="col-span-3 custom-lg:col-span-2">
                                  <img
                                    className="w-full aspect-square rounded-full object-cover"
                                    src={
                                      event.eventImageUrl ||
                                      "../assets/images/image_avatar.jpg"
                                    }
                                    alt="Event"
                                  />
                                </div>
                                <div className="col-span-13 custom-lg:col-span-14 flex flex-col gap-0.5">
                                  <div className="flex flex-col items-start justify-between sm:flex-row">
                                    <h3 className="text-[0.85rem] text-neutral-800 font-semibold sm:text-base">
                                      {event.title}
                                    </h3>
                                    <h6 className="text-[0.7rem]">
                                      {event.date}
                                    </h6>
                                  </div>
                                  <p className="hidden text-gray-500 text-[0.8rem] leading-4 sm:block">
                                    {event.description.slice(0, 80) + "..."}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li className="text-[0.825rem] text-neutral-700 capitalize">
                            No Events Hosted Yet!
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {profileData.role === "admin" &&
                    profileData.adminAtClubs.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-primary-500 font-semibold">
                          Clubs Admin
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                          {profileData.adminAtClubs.map((club) => (
                            <li key={club.nameSlug}>
                              <Link
                                to={`/clubs/${club._id}`}
                                className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-3 border p-2.5 rounded"
                              >
                                <div className="col-span-3 custom-lg:col-span-2">
                                  <img
                                    className="w-full aspect-square rounded-full object-cover"
                                    src={
                                      club.clubImageUrl ||
                                      "../assets/images/image_avatar.jpg"
                                    }
                                    alt="Event"
                                  />
                                </div>
                                <div className="col-span-13 custom-lg:col-span-14 flex flex-col gap-0.5">
                                  <h3 className="text-[0.85rem] text-neutral-800 font-semibold sm:text-base">
                                    {club.name}
                                  </h3>
                                  <p className="hidden text-gray-500 text-[0.7rem] leading-4 sm:text-[0.8rem] sm:block">
                                    {club.description.slice(0, 80) + "..."}
                                  </p>
                                  <ul className="hidden gap-1.5 items-center mt-1 flex-wrap sm:flex">
                                    {club.events.slice(0, 3).map((event) => (
                                      <li
                                        key={event.titleSlug}
                                        className="border-[1px] border-primary-500 text-[0.75rem] text-primary-500 py-0.5 px-1 rounded-sm"
                                      >
                                        {event.title}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                <div className="flex flex-col px-6 py-6 border-l-[1px] gap-2">
                  <h3 className="text-primary-500 font-semibold capitalize">
                    Following Clubs
                  </h3>
                  {profileData.followingClubs.length ? (
                    <ul className="flex flex-col gap-2.5">
                      {profileData.followingClubs.map((club) => (
                        <li key={club.nameSlug}>
                          <Link
                            to={`/clubs/${club._id}`}
                            className="flex flex-col gap-2 items-start border p-2.5 rounded flex-wrap"
                          >
                            <div className="flex items-center gap-2.5">
                              <div>
                                <img
                                  className="w-[3.5rem] aspect-square rounded-full object-cover"
                                  src={
                                    club.clubImageUrl ||
                                    "../assets/images/image_avatar.jpg"
                                  }
                                  alt="Event"
                                />
                              </div>
                              <h3 className="text-[0.85rem] text-neutral-800 font-semibold sm:text-base capitalize">
                                {club.name}
                              </h3>
                            </div>
                            <div className="flex flex-col gap-2">
                              <ul className="hidden gap-1.5 items-center mt-0.5 flex-wrap sm:flex">
                                {club.events.map((event) => (
                                  <li
                                    key={event.titleSlug}
                                    className="border-[1px] border-primary-500 capitalize text-[0.7rem] text-primary-500 py-0.5 px-1 rounded-sm"
                                  >
                                    {event.title}
                                  </li>
                                ))}
                              </ul>
                              <p className="text-gray-500 text-[0.7rem] leading-4 sm:text-[0.8rem]">
                                {club.description.slice(0, 100) + "..."}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <h6 className="text-[0.825rem] text-neutral-700 capitalize">
                      No Clubs Followed Yet!
                    </h6>
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
                <Loader2 className="size-10 animate-spin text-primary-500" />
              </div>
            )}
          </div>
        </section>
        {showUpdateProfileModal && (
          <UpdateProfileModal handleClick={handleClick} />
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProfilePage;
