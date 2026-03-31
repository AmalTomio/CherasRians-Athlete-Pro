module.exports = function validateProfile(data, role) {
  const errors = [];

  if (!data.firstName || data.firstName.length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!data.lastName || data.lastName.length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (!data.email || !data.email.includes("@")) {
    errors.push("Invalid email format");
  }

  if (role === "coach" && data.age !== undefined) {
    if (isNaN(data.age) || data.age < 18) {
      errors.push("Invalid age");
    }
  }

  if (role === "student") {
    if (data.height && isNaN(data.height)) {
      errors.push("Height must be number");
    }
    if (data.weight && isNaN(data.weight)) {
      errors.push("Weight must be number");
    }
  }

  return errors;
};