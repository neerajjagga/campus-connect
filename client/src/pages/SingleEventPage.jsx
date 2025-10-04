import { Navigate, useNavigate, useParams } from "react-router-dom";
import useEventStore from "../stores/eventStore";
import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CalendarDays, Loader2, MapPin, User } from "lucide-react";
import { Link } from "react-router-dom";

const SingleEventPage = () => {
  const { eventId } = useParams();
  const { event, isEventFetched, getSingleEvent } = useEventStore();
  const navigate = useNavigate();

  async function fetchSingleEvent() {
    const isSuccess = await getSingleEvent(eventId);
    if (!isSuccess) {
      navigate("/events");
    }
  }

  useEffect(() => {
    fetchSingleEvent(eventId);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />
      <main>
        <div className="w-full max-w-[72rem] py-8 px-6 mx-auto md:px-10">
          <div className="min-h-[65vh] rounded-md shadow-md border-[1px]">
            {isEventFetched ? (
              <div>
                <div className="relative w-full h-64 md:h-96 rounded-md transition group">
                  <img
                    src={
                      event.eventImageUrl || "../assets/images/image_avatar.jpg"
                    }
                    alt={event.title}
                    className="w-full h-full aspect-[3/2] object-cover rounded-t-md"
                  />
                  <div className="hidden absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent items-center justify-center group-hover:flex">
                    <h2 className="text-white text-3xl font-bold">
                      {event.title} Event
                    </h2>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-md p-6 mt-2 flex flex-col gap-4">
                  <div className="flex flex-wrap flex-col justify-between gap-4 sm:flex-row">
                    <h1 className="text-3xl text-primary-500 font-semibold text-primary-600">
                      {event.title}
                    </h1>
                    {event.registrationUrl ? (
                      <Link
                        target="_blank"
                        to={event.registrationUrl}
                        className="bg-primary-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-primary-600 hover:bg-primary-300"
                      >
                        Register Now
                      </Link>
                    ) : (
                      <div className="bg-gray-300 text-neutral-600 px-4 py-2 rounded-md">
                        No Registration Yet
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <CalendarDays className="text-primary-500 size-6" />
                      <span className="font-medium">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="text-primary-500 size-6" />
                      <span className="font-medium">{event.location}</span>
                    </div>
                  </div>

                  {event.category.length > 0 && (
                    <ul className="flex flex-wrap items-center gap-2">
                      {event.category.map((text) => (
                        <li
                          key={text}
                          className="px-2.5 py-1 rounded-sm bg-primary-500 text-white text-sm"
                        >
                          {text}
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>

                  {event.clubs && (
                    <div className="mt-4">
                      <span className="font-semibold text-primary-600">
                        Organized by:
                      </span>
                      <p className="text-gray-700">{event.clubs.name}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <img
                      src={
                        event.author.profileImageUrl ||
                        "../assets/images/avatar.png"
                      }
                      alt={event.author.name}
                      className="w-8 rounded-full border border-primary-500"
                    />
                    <span className="text-gray-600">
                      Hosted by{" "}
                      <strong className="text-primary-500">
                        {event.author.name}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2">
                <Loader2 className="size-10 animate-spin text-primary-500" />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SingleEventPage;
