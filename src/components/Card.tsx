import {
  Airplay,
  ChartNoAxesCombined,
  Earth,
  Eye,
  FilePenLine,
  Mail,
  MessageSquareMore,
  SearchCheck,
  Send,
  Sparkles,
  TextAlignStart,
  Users,
} from "lucide-react";

export default function Card() {
  return (
    <>
      {/* // Estilo para la card de los objetivos */}
      <div className="card w-96 bg-base-100 card-lg shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Large Card</h2>
          <p>
            A card component has a figure, a body part, and inside body there
            are title and actions parts
          </p>
          <div className="justify-end card-actions">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>

      {/* //ICONOS */}
      <Eye />
      <Earth />
      <ChartNoAxesCombined />
      <Sparkles />
      <Users />
      <FilePenLine />
      <SearchCheck />
      <Mail />
      <TextAlignStart />
      <MessageSquareMore />
      <Send />

      {/* Estilo para la card de accion */}
      <div className="card card-side bg-base-100 shadow-sm w-150">
        <figure>
          <img
            src="https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.webp"
            alt="Movie"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">New movie is released!</h2>
          <p>Click the button to watch on Jetflix app.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Watch</button>
          </div>
        </div>
      </div>
    </>
  );
}
