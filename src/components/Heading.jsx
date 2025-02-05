import Tagline from "./Tagline";

const Heading = ({ className, title, text, tag }) => {
  return (
    <div className={`${className} max-w-[50rem] mx-auto mt-12 lg:mb-20`}>
      {tag && <Tagline className="my-8 md:justify-center">{tag}</Tagline>}
      {title && <h2 className="h2 text-center">{title}</h2>}
      {text && <p className="body-2 mt-4 text-n-4 text-center">{text}</p>}
    </div>
  );
};

export default Heading;
