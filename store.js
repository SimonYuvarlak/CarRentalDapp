const CarRentalPlatform = artifacts.require("CarRentalPlatform");

contract("CarRentalPlatform", (accounts) => {
  let carRentalPlatform;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    // carRentalPlatform = await carRentalPlatform.new();
    carRentalPlatform = await CarRentalPlatform.new();
  });

  it("adds a user", async () => {
    await carRentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.name, "Alice");
    assert.equal(user.lastname, "Smith");
  });

  it("adds a car", async () => {
    await carRentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    const car = await carRentalPlatform.getCar(1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.imgUrl, "https://example.com/img.jpg");
    assert.equal(car.rentFee, 10);
    assert.equal(car.saleFee, 50000);
  });

  it("checks out a car", async () => {
    await carRentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await carRentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(user1, 1, { from: owner });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 1);
  });

  it("checks in a car", async () => {
    await carRentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await carRentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(user1, 1, { from: owner });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await carRentalPlatform.checkIn(user1, { from: owner });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 0);
    assert.equal(user.debt, 10);
  });

  it("makes a payment", async () => {
    await carRentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await carRentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await carRentalPlatform.checkOut(user1, 1, { from: owner });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await carRentalPlatform.checkIn(user1, { from: owner });
    await carRentalPlatform.deposit(user1, { from: user1, value: 100 });
    await carRentalPlatform.makePayment(user1, { from: owner });
    const user = await carRentalPlatform.getUser(user1);
    assert.equal(user.debt, 0);
  });
});
