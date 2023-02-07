const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-evenly bg-gold-400">
      <div className="flex h-64 w-64 items-center justify-center bg-white text-6xl font-bold">
        LOGO
      </div>
      <div className="flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          fill="currentColor"
          className="h-64 w-64 text-blue-500"
        >
          <path
            fillRule="evenodd"
            d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur="1s"
              from="0 50 50"
              to="360 50 50"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
