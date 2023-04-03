const RentalPlatform = artifacts.require("RentalPlatform");

contract("RentalPlatform", (accounts) => {
  let rentalPlatform;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    // rentalPlatform = await RentalPlatform.new();
    rentalPlatform = await RentalPlatform.new();
  });

  it("adds a user", async () => {
    await rentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    const user = await rentalPlatform.getUser(user1);
    assert.equal(user.name, "Alice");
    assert.equal(user.lastname, "Smith");
  });

  it("adds a car", async () => {
    await rentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    const car = await rentalPlatform.getCar(1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.imgUrl, "https://example.com/img.jpg");
    assert.equal(car.rentFee, 10);
    assert.equal(car.saleFee, 50000);
  });

  it("checks out a car", async () => {
    await rentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await rentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await rentalPlatform.checkOut(user1, 1, { from: owner });
    const user = await rentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 1);
  });

  it("checks in a car", async () => {
    await rentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await rentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await rentalPlatform.checkOut(user1, 1, { from: owner });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await rentalPlatform.checkIn(user1, { from: owner });
    const user = await rentalPlatform.getUser(user1);
    assert.equal(user.rentedCarId, 0);
    assert.equal(user.debt, 10);
  });

  it("makes a payment", async () => {
    await rentalPlatform.addUser(user1, "Alice", "Smith", { from: owner });
    await rentalPlatform.addCar(1, "Tesla Model S", "https://example.com/img.jpg", 10, 50000, { from: owner });
    await rentalPlatform.checkOut(user1, 1, { from: owner });
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 minute
    await rentalPlatform.checkIn(user1, { from: owner });
    await rentalPlatform.deposit(user1, { from: user1, value: 100 });
    await rentalPlatform.makePayment(user1, { from: owner });
    const user = await rentalPlatform.getUser(user1);
    assert.equal(user.debt, 0);
  });
});
