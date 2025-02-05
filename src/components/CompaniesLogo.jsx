import { companyLogos } from "../constants";

const CompaniesLogo = ({ className }) => {
  return (
    <div className={className}>
      <h5 className="tagline mb-6 text-center text-n-1/50">
        Helping people create beautiful content at
      </h5>
      <ul className="flex">
        {companyLogos.map((items, index) => (
          <li
            className="flex items-center justify-center flex-1 h-[8.5rem]"
            key={index}
          >
            <img src={items} width={134} height={28} alt={items} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompaniesLogo;
