import React from "react";

{/* <div className="shadow-md shadow-white rounded-lg p-2 m-4 border border-white">
      <div className="grid grid-cols-3 w-[15vw]">
        <div className="col-span-2 py-2 px-4">
          <div className="py-2 text-white">{props.label}</div>
          <div className="py-2 text-white">{props.number}</div>
        </div>
        <div className="basis-1/3 m-auto">
          <div className="text-4xl text-white">{props.icon}</div>
        </div>
      </div>
    </div> */}

const InfoBox = (props) => {
  return (
    <div className="border gap-4 m-4 backdrop-blur rounded-md grid grid-flow-col p-4 text-white border-white">
      <div className="space-y-2">
          <div className="">{props.label}</div>
          <div className="">{props.number}</div>
        </div>
          <div className="place-self-center text-4xl text-white">{props.icon}</div>
    </div>
  );
};

export default InfoBox;
