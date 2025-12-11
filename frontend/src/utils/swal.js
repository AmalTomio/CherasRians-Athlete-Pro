// src/utils/swal.js
import Swal from "sweetalert2";

export const successAlert = (message) => {
  return Swal.fire({
    icon: "success",
    title: "Success",
    timer: 1500,
    text: message,
    confirmButtonColor: "#007bff",
  });
};

export const errorAlert = (message) => {
  return Swal.fire({
    icon: "error",
    title: "Error",
    timer: 1500,
    text: message,
    confirmButtonColor: "#dc3545",
  });
};

export const warningAlert = (message) => {
  return Swal.fire({
    icon: "warning",
    title: "Warning",
    timer: 1500,
    text: message,
    confirmButtonColor: "#ffc107",
    confirmButtonText: "OK",
  });
};

export const infoAlert = (message) => {
  return Swal.fire({
    icon: "info",
    title: "Info",
    timer: 1500,
    text: message,
    confirmButtonColor: "#17a2b8",
  });
};

export const toastAlert = (message, icon = "success") => {
  return Swal.fire({
    icon,
    title: message,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
};

export const confirmAlert = {
  fire: (options) => {
    return Swal.fire({
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
      ...options
    });
  }
};