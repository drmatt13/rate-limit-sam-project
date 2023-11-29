// css
import "../css/clouds.css";

const CloudsBackground = () => {
  return (
    <>
      <div className="z-10 absolute top-0 left-0 w-full h-full max-h-screen bg-black/10 overflow-hidden">
        <div id="foglayer_01" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
        <div id="foglayer_02" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
        <div id="foglayer_03" className="fog">
          <div className="image01"></div>
          <div className="image02"></div>
        </div>
      </div>
    </>
  );
};

export default CloudsBackground;
