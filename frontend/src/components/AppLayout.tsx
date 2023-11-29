import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// images
import background from "../assets/images/8155b41ae43140299c342079a2c134dd-700.jpg";
import CloudsBackground from "./CloudsBackground";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <>
      {["/login", "/register"].includes(location.pathname) && (
        <CloudsBackground />
      )}
      <div className="w-full h-screen relative text-white">
        <div>
          <div
            className={`${
              !["/login", "/register"].includes(location.pathname) &&
              "bg-black/30"
            } absolute top-0 left-0 w-screen h-screen z-10 pointer-events-none transition-colors`}
          />
          <img
            className="w-full h-full object-cover absolute top-0 left-0 z-0 pointer-events-none"
            src={background}
            alt="background"
          />
        </div>
        <div className="z-10 absolute top-0 w-full min-h-screen">
          {children}
        </div>
      </div>
    </>
  );
};

export default AppLayout;
