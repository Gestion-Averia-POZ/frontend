export default function Button() {
  return (
    <>
      <button className="btn btn-primary rounded-xl btn-xs m-4 sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
        Primary
      </button>

      <button className="btn bg-white/10 backdrop-blur-md border-white/20 rounded-xl btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
        Secondary
      </button>
    </>
  );
}
