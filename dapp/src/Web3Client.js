import Web3 from "web3";
import RenterABI from "./ABI/RentalPlatform.json";

let selectedAccount;
let renterContract;
let isInitialized = false;
let renterContractAddress = "0xfBc8b5659510d1f281A863b005cD1b3a0Ca82667";

export const init = async () => {
  // Configure contract
  let provider = window.ethereum;

  if (typeof provider !== "undefined") {
    provider
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        selectedAccount = accounts[0];
      })
      .catch((err) => {
        // console.log(err);
        return;
      });
  }

  window.ethereum.on("accountChanged", function (accounts) {
    selectedAccount = accounts[0];
  });

  const web3 = new Web3(provider);

  const networkId = await web3.eth.net.getId();

  renterContract = new web3.eth.Contract(RenterABI.abi, renterContractAddress);

  isInitialized = true;
};

export const getUserAddress = async () => {
  if (!isInitialized) {
    await init();
  }
  return selectedAccount;
};

// Execute Functions

// function addUser(address payable walletAddress, string memory name, string memory lastname) public {
//   require(!isUser(walletAddress), "User already exists!");
//   users[walletAddress] = User(walletAddress, name, lastname, 0, 0, 0, 0, 0);
// }
export const register = async (name, surname) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .addUser(selectedAccount, name, surname)
    .send({ from: selectedAccount });
  return res;
};

// function activateCar(uint id) public onlyOwner {
//   require(cars[id].id != 0, "Car does not exist!");
//   cars[id].availableForRent = true;
// }
export const activateCar = async (id) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .activateCar(id)
    .send({ from: selectedAccount });
  return res;
};

// function addCar(uint id, string memory name, string memory url, uint rent, uint sale) public onlyOwner {
//   require(cars[id].id == 0, "Car with this id already exists!");
//   cars[id] = Car(id, name, url, true, rent, sale);
//   carIds.push(id);
// }
export const addCar = async (id, name, url, rentFee, saleFee) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .addCar(id, name, url, rentFee, saleFee)
    .send({ from: selectedAccount });
  return res;
};

// function checkIn(address payable walletAddress) public {
//   require(isUser(walletAddress), "User does not exist!");
//   uint rentedCarId = users[walletAddress].rentedCarId;
//   require(rentedCarId != 0, "User has not rented a car!");

//   users[walletAddress].end = block.timestamp;
//   users[walletAddress].debt += calculateDebt(walletAddress);

//   users[walletAddress].rentedCarId = 0;
//   users[walletAddress].start = 0;
//   users[walletAddress].end = 0;
//   cars[rentedCarId].availableForRent = true;
// }
export const checkIn = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .checkIn(selectedAccount)
    .send({ from: selectedAccount });
  return res;
};

// function checkOut(address payable walletAddress, uint id) public {
//   require(isUser(walletAddress), "User does not exist!");
//   require(isCarActive(id), "Car is not available for rent!");
//   require(users[walletAddress].rentedCarId == 0, "User has already rented a car!");
//   require(users[walletAddress].debt == 0, "User has an outstanding debt!");

//   users[walletAddress].start = block.timestamp;
//   users[walletAddress].rentedCarId = id;
//   cars[id].availableForRent =  false;
// }
export const checkOut = async (id) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .checkOut(selectedAccount, id)
    .send({ from: selectedAccount });
  return res;
};

// function deactivateCar(uint id) public onlyOwner {
//   require(cars[id].id != 0, "Car does not exist!");
//   cars[id].availableForRent = false;
// }
export const deActivateCar = async (id) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .deactivateCar(id)
    .send({ from: selectedAccount });
  return res;
};

// function deposit(address payable walletAddress) public payable {
//   require(isUser(walletAddress), "User does not exist!");
//   users[walletAddress].balance += msg.value;
// }
export const deposit = async (value) => {
  if (!isInitialized) {
    await init();
  }
  let send_value = Web3.utils.toWei(value, "ether");
  let res = await renterContract.methods
    .deposit(selectedAccount)
    .send({ from: selectedAccount, value: send_value });
  return res;
};

// function makePayment(address payable walletAddress) public {
//   require(isUser(walletAddress), "User does not exist!");
//   uint debt = users[walletAddress].debt;
//   uint balance = users[walletAddress].balance;
//   require(debt > 0, "User has no debt!");
//   require(balance >= debt, "User has insufficient balance!");

//   users[walletAddress].balance -= debt;
//   users[walletAddress].debt = 0;
// }
export const makePayment = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .makePayment(selectedAccount)
    .send({ from: selectedAccount });
  return res;
};

// function setOwner(address payable _newOwner) external onlyOwner {
//   owner = _newOwner;
// }
export const setOwner = async (newOwner) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods
    .setOwner(newOwner.toLowerCase())
    .send({ from: selectedAccount });
  return res;
};

// Query functions

// function getCarIds() public view returns (uint[] memory) {
//   return carIds;
// }
export const getAllCars = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getCarIds().call();
  return res;
};

// function getCar(uint id) public view returns(Car memory) {
//   require(cars[id].id != 0, "Car does not exist!");
//   return cars[id];
// }
export const getCar = async (id) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getCar(id).call();
  return res;
};

// function getUserBalance(address payable walletAddress) public view returns(uint) {
//   require(isUser(walletAddress), "User does not exist!");
//   return users[walletAddress].balance;
// }
export const getUserBalance = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getUserBalance(selectedAccount).call();
  return res;
};

// function getUserDebt(address payable walletAddress) public view returns(uint) {
//   require(isUser(walletAddress), "User does not exist!");
//   return users[walletAddress].debt;
// }
export const getUserDebt = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getUserDebt(selectedAccount).call();
  return res;
};

// function isCarActive(uint id) public view returns(bool) {
//   require(cars[id].id != 0, "Car does not exist!");
//   return cars[id].availableForRent;
// }
export const isCarActive = async (id) => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.isCarActive(id).call();
  return res;
};

// function getOwner() external view returns(address) {
//   return owner;
// }
export const getOwner = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getOwner().call();
  return res.toString();
};

// function getUser(address payable walletAddress) public view returns (User memory) {
//   require(isUser(walletAddress), "User does not exist!");
//   return users[walletAddress];
// }
export const login = async () => {
  if (!isInitialized) {
    await init();
  }
  let res = await renterContract.methods.getUser(selectedAccount).call();
  return res;
};
