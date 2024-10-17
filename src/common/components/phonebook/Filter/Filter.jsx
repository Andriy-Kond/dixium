import { selectFilters } from "app/selectors";
import { setFilter } from "features/filters/filtersSlice";
import { useDispatch, useSelector } from "react-redux";

function Filter() {
  const dispatch = useDispatch();
  const filter = useSelector(selectFilters);

  const handleFilter = e => {
    dispatch(setFilter(e.target.value));
  };

  return (
    <label>
      Filter contacts here
      <input type="text" value={filter} onChange={handleFilter} />
    </label>
  );
}

export default Filter;
