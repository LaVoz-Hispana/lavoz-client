let navigate = null;

export const setNavigate = (navigateFunction) => {
  navigate = navigateFunction;
};

export const navigateTo = (path) => {
  if (navigate) {
    navigate(path);
  } else {
    window.location.href = path;
  }
};
