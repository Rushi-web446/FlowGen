const HomeSlider = ({ logout, isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <h2>Menu</h2>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default HomeSlider;