// Css
import "./App.css";
// Local Components
import InfoBox from "./components/InfoBox";
import TopLabel from "./components/TopLabel";
import Status from "./components/Status";
import InputComponent from "./components/InputComponent";
import Header from "./components/Header";
import CarComponent from "./components/CarComponent";
import Modal from "./components/UI/Modal";
import GradientButton from "./components/reusables/GradientButton";
import AdminActions from "./components/AdminActions";
import DueComponent from "./components/DueComponent";
import {
  getUserAddress,
  register,
  getAllCars,
  getCar,
  getOwner,
  login,
} from "./Web3Client";
// Assets

// External exports
import { BiWalletAlt, BiTimeFive } from "react-icons/bi";
import { GiToken } from "react-icons/gi";
import { useState, useEffect } from "react";
import Web3 from "web3";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [cars, setCars] = useState([]);
  const [name, setName] = useState({});
  const [lastName, setLastName] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCredit, setUserCredit] = useState("0");
  const [due, setDue] = useState("0");
  const [isAvailable, setIsAvailable] = useState("Can Rent");
  const [rideMins, setRideMins] = useState("0");

  const emptyAddress = "0x0000000000000000000000000000000000000000";

  useEffect(() => {
    const handleInit = async () => {
      let isAUser = await login();
      // If the user exists
      if (isAUser.address !== emptyAddress) {
        setLoggedIn(true); //login user
        // set user credits
        setUserCredit(
          Web3.utils.fromWei(String(isAUser.balance), "ether").toString()
        );
        // set user due
        setDue(Web3.utils.fromWei(String(isAUser.debt), "ether").toString());
        // set user name
        setUserName(isAUser.name);
        // get the user address
        let address = await getUserAddress();
        // get the owner
        let owner = await getOwner();
        // see if the user is the owner
        if (address === owner.toLowerCase()) {
          setIsAdmin(true);
        }
        // get cars
        let carArray = await getAllCars();
        await getCars(carArray);
        // update user status
        if (isAUser.rentedCarId !== 0) {
          let rentedCar = await getCar(isAUser.rentedCarId);
          setIsAvailable(`Rented ${rentedCar.name} - ${rentedCar.id}`);
        } else {
          if (isAUser.debt !== 0) {
            setIsAvailable("Pay your due before renting again!");
          }
        }
        // adjust ride time
        let rideMins = "0";
        if (isAUser.rentedCarId !== 0) {
          if (isAUser.end !== "0") {
            rideMins = Math.floor((isAUser.end - isAUser.start) / 60).toString();
          } else {
            rideMins = Math.floor((Math.floor(Date.now() / 1000) - isAUser.start) / 60).toString();
          }
        }
        setRideMins(rideMins);
      }
    };

    handleInit();
  }, []);

  const updateLoading = (data) => {
    switch (data) {
      case 1:
        setUserCredit("...");
        break;
      case 2:
        setDue("...");
        break;
      case 3:
        setRideMins("...");
        break;
      case 4:
        setIsAvailable("...");
        break;
      default:
        console.log("invalid data number");
        break;
    }
  };

  const updateData = async () => {
    let user = await login();
    if (user.address !== emptyAddress) {
      // set user credits
      setUserCredit(
        Web3.utils.fromWei(String(user.balance), "ether").toString()
      );
      // set user due
      setDue(Web3.utils.fromWei(String(user.debt), "ether").toString());
      // set ride mins
      let rideMins = "0";
        if (user.rentedCarId !== 0) {
          if (user.end !== 0) {
            rideMins = Math.floor((user.end - user.start) / 60).toString();
          } else {
            rideMins = Math.floor((Math.floor(Date.now() / 1000) - user.start) / 60).toString();
          }
        }
        setRideMins(rideMins);
      // update user status
      if (user.rentedCarId && user.rentedCarId !== 0) {
        let rentedCar = await getCar(user.rentedCarId);
        setIsAvailable(`Rented ${rentedCar.name} - ${rentedCar.id}`);
      } else {
        if (user.debt !== 0) {
          setIsAvailable("Pay your due before renting again!");
        } else {
          setIsAvailable("Can Rent");
        }
      }
      // get cars
      let carArray = await getAllCars();
      await getCars(carArray);
    }
  };

  const getCars = async (cars) => {
    let carArr = [];
    cars.forEach(async (element) => {
      let car = await getCar(element);
      carArr.push({
        id: car.id,
        name: car.name,
        imgUrl: car.imgUrl,
        availableForRent: car.availableForRent,
        rentFee: car.rentFee,
        saleFee: car.saleFee,
      });
      setCars(carArr);
    });
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  return (
    <div className="h-full bg-[url('./assets/background.jpg')]  bg-cover bg-center  bg-no-repeat ">
      {/* Header */}
      <Header loggedIn={loggedIn} />
      {/* Title */}
      {loggedIn ? (
        <div>
          <div className="mt-12">
            <TopLabel userName={userName} />
          </div>
          <div className="grid place-content-center mt-8">
            {isAdmin && (
              <GradientButton
                onClick={() => setShowModal(true)}
                title="Admin Actions"
              />
            )}
          </div>
          {/* Data Section */}
          <div className=" mx-auto grid place-content-center  mt-12">
            <div className="flex flex-row items-center">
              <div className="grid grid-flow-row md:grid-flow-col  items-center">
                <InfoBox
                  label="BNB Credit"
                  number={userCredit}
                  icon={<BiWalletAlt />}
                />
                <InfoBox label="BNB Due" number={due} icon={<GiToken />} />
                <InfoBox
                  label="Ride Minutes"
                  number={rideMins}
                  icon={<BiTimeFive />}
                />
                <div className="grid place-items-center">
                  <Status status={isAvailable} />
                </div>
              </div>
            </div>
          </div>
          {/* Input Section */}
          <div className="place-content-center  grid items-center p-4 mt-12">
            <InputComponent
              holder=" Credit balance"
              label="Credit your account"
              funcBefore={updateLoading}
              funcAfter={updateData}
            />
            <DueComponent
              label="Pay your due"
              funcBefore={updateLoading}
              funcAfter={updateData}
            />
          </div>
          {/* Car Section */}
          <div className="grid md:grid-flow-col gap-4 gap-y-12 justify-evenly mt-24 pb-24">
            {cars.length > 0 ? (
              cars.slice(0, 3).map((car) => (
                <div key={car.id}>
                  <CarComponent
                    isActive={car.availableForRent}
                    carFee={car.rentFee}
                    saleFee={car.saleFee}
                    image={car.imgUrl}
                    id={car.id}
                    name={car.name}
                    funcBefore={updateLoading}
                    funcAfter={updateData}
                  />
                </div>
              ))
            ) : (
              <div>
                <div className="text-white text-4xl mb-60">LOADING CARS...</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="h-screen text-white  w-full">
            <div className=" p-4 mt-10 grid place-content-center">
              <h1 className="text-2xl font-bold text-center">Register To Car Rental Platform</h1>
              <h3 className="text-center mt-4">
                Enter your name and surname to register
              </h3>
              <div className="grid mb-8 mt-4 grid-flow-row">
                <input
                  className="p-2 mb-4 text-black rounded-md"
                  placeholder="Enter your Name"
                  onChange={handleNameChange}
                />
                <input
                  className="p-2 mb-4 text-black rounded-md"
                  placeholder="Enter your Surname"
                  onChange={handleLastNameChange}
                />
                <GradientButton
                  title="Register"
                  onClick={() => {
                    register(name, lastName);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
      {showModal && (
        <Modal close={() => setShowModal(false)}>
          <AdminActions />
        </Modal>
      )}
    </div>
  );
}

export default App;
