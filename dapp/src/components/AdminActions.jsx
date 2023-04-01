import React from "react";
import UserInput from "./reusables/UserInput";

const AdminActions = () => {
  return (
    <section className="grid place-items-center grid-flow-row overflow-hidden">
      <h2 className="font-bold text-2xl">Admin Actions</h2>
      <UserInput label="Activate Car" placeholder="Car id" name="activeCarId" />
      <UserInput
        label="Deactivate Car"
        placeholder="Car id"
        name="deactivateCarId"
      />
      <UserInput
        label="Add Car"
        placeholder="id, url, rentFee, saleFee"
        name="addCar"
      />
      <UserInput
        label="Set Owner"
        placeholder="New owner address"
        name="setOwner"
      />
    </section>
  );
};

export default AdminActions;
