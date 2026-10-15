import lungsHealthy from "../../assets/lungs-healthy.png";
import lungsDamaged from "../../assets/lungs-damaged.png";

export function LungAnimation() {
  return (
    <div className="relative w-full max-w-[200px] mx-auto mt-4 rounded-xl overflow-hidden">
      <img
        src={lungsDamaged}
        alt=""
        aria-hidden="true"
        className="w-full h-auto rounded-xl"
      />
      <img
        src={lungsHealthy}
        alt=""
        aria-hidden="true"
        className="w-full h-auto rounded-xl absolute inset-0"
        style={{
          animation: "lungFade 4s ease-in-out infinite alternate",
        }}
      />
      <style>{`
        @keyframes lungFade {
          0%   { opacity: 0; }
          30%  { opacity: 0; }
          70%  { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}