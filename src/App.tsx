import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import {useState} from 'react';
import axios from 'axios';

type user = {
  firstName: string,
  lastName: string,
  employeeId: number,
  grossSalary: number,
  salutation: string,
  gender: string,
  color: string,
}

const fetchUsers = () : Promise<user[]>  => {
  return axios.get('http://localhost:8080/users')
    .then(x => x.data._embedded.users);
}

const enumToDisplay = (s: string) : string => {
  return s[0] + s.slice(1, s.length).toLowerCase();
}

const colorToTailwindBG = (s: string) : string => {
  if(s === "DEFAULT") return "";
  return "bg-" + s.toLowerCase() + "-200";
}

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
    <ListUsers />
    </QueryClientProvider>
  );
}

const ListUsers =  () : JSX.Element=> {
  const {data, error, isLoading} = useQuery('users', fetchUsers);


  const [selected, setSelected] = useState(0);

  if(error) return <p>{"Error loading users"}</p>
  if(isLoading) return <div/>;

  const dataLen = data ? data.length : 0;

  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="font-bold mt-10 mb-2">{"Current Employees"}</h2>

      <table className="table-fixed w-10/12 border-black border border-collapse">
        <thead className="bg-gray-300">
          <tr>
            <th scope="col">
              Employee Id
            </th>
            <th scope="col">
              First Name
            </th>
            <th scope="col">
              Last Name
            </th>
            <th scope="col">
              Salutation
            </th>
            <th scope="col">
              Profile Color
            </th>
          </tr>
        </thead>
        {
          data && data.map((x, index) => <tr className={
            (selected === index ? colorToTailwindBG(x.color): (index % 2 === 0 ? "bg-gray-100" : "bg-white") + " cursor-pointer")} onClick={_ => setSelected(index)}>
            <td>{x.employeeId.toString()}</td>
            <td>{x.firstName.toString()}</td>
            <td>{x.lastName.toString()}</td>
            <td>{enumToDisplay(x.salutation) + "."}</td>
            <td >{enumToDisplay(x.color)}</td>
          </tr>)
        }
        <tr className={dataLen % 2 === 0 ?"bg-gray-100" : "bg-white"}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
        <tr className={(dataLen + 1) % 2 === 0 ?"bg-gray-100" : "bg-white"}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
      </table>
    </div>
  )
}

export default App;
