import Query, {
  useQuery,
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import axios from "axios";

type user = {
  firstName: string;
  lastName: string;
  employeeId: number;
  grossSalary: number;
  salutation: string;
  gender: string;
  color: string;
};

const fetchUsers = (): Promise<user[]> => {
  return axios
    .get("http://localhost:8080/users")
    .then((x) => x.data._embedded.users);
};

const addUser = (user: user): Promise<void> => {
  return axios.post("http//localhost:8080/users", user);
};

const enumToDisplay = (s: string): string => {
  return s[0] + s.slice(1, s.length).toLowerCase();
};

// make these explicit as tailwind checks for the strings in code.
const colorToTailwindBG = (s: string): string => {
  switch (s) {
    case "GREEN":
      return "bg-green-400";
    case "BLUE":
      return "bg-blue-400";
    case "RED":
      return "bg-red-400";
    case "DEFAULT":
      return "";
  }
  return "";
};

const colorToTailwindBGSafe = (s: string): string => {
  return colorToTailwindBG(s) || "bg-gray-300";
};

const hoverBackgroundProfile = (s: string): string => {
  switch (s) {
    case "GREEN":
      return "hover:bg-green-400";
    case "BLUE":
      return "hover:bg-blue-500";
    case "RED":
      return "hover:bg-red-400";
    case "DEFAULT":
      return "hover:bg-gray-400";
  }
  return "";
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Index />
    </QueryClientProvider>
  );
};

let defaultUserFormProps = {
  firstName: "",
  lastName: "",
  gender: "M",
  salutation: "MR",
  salary: "",
  profile: "DEFAULT",
  employeeId: "",
};

const Index = () => {
  const { data, error, isLoading } = useQuery("users", fetchUsers);
  const { mutate } = useMutation("userAdd", addUser, {
    onSuccess: () => queryClient.invalidateQueries("users"),
  });

  const [selected, setSelected] = useState(-1);

  let userFormProps = { ...defaultUserFormProps, mutate };
  if (data && data.length > 0 && selected !== -1 && selected < data.length) {
    let selectedUser = data[selected];
    userFormProps = {
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      gender: selectedUser.gender,
      salutation: selectedUser.salutation,
      salary: selectedUser.grossSalary.toString(),
      profile: selectedUser.color,
      employeeId: selectedUser.employeeId.toString(),
      mutate,
    };
  }

  return (
    <>
      <ListUsers
        hasError={!!error}
        isLoading={isLoading}
        data={data}
        selected={selected}
        setSelected={setSelected}
      />
      <UserForm {...userFormProps} key={JSON.stringify(userFormProps)} />
    </>
  );
};

type listUserProps = {
  hasError: boolean;
  isLoading: boolean;
  data: user[] | undefined;
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
};

const ListUsers = ({
  hasError,
  isLoading,
  data,
  selected,
  setSelected,
}: listUserProps): JSX.Element => {
  if (hasError) return <p>{"Error loading users"}</p>;
  if (isLoading) return <div />;

  let dataSafe = data as user[];

  return (
    <div className="w-full flex flex-col items-center text-center">
      <div className="w-full relative mt-10">
        <h2 className="font-bold  mb-2 inline-block w-40">
          {"Current Employees"}
        </h2>
        <button
          className="bg-gray-300 hover:bg-gray-400 mx-2 px-4 rounded absolute right-20 "
          onClick={() => setSelected(-1)}
        >
          Add User
        </button>
      </div>

      <table className="table-fixed w-11/12 border-black border">
        <thead className="bg-gray-300">
          <tr>
            <th scope="col">Employee Id</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Salutation</th>
            <th scope="col">Profile Color</th>
          </tr>
        </thead>
        <tbody>
          {dataSafe.map((x, index) => (
            <tr
              className={
                selected === index
                  ? colorToTailwindBG(x.color)
                  : (index % 2 === 0 ? "bg-gray-100" : "bg-white") +
                    " cursor-pointer"
              }
              onClick={(_) => setSelected(index)}
              key={index.toString()}
            >
              <td>{x.employeeId.toString()}</td>
              <td>{x.firstName.toString()}</td>
              <td>{x.lastName.toString()}</td>
              <td>{enumToDisplay(x.salutation) + "."}</td>
              <td>{enumToDisplay(x.color)}</td>
            </tr>
          ))}
          <tr
            className={dataSafe.length % 2 === 0 ? "bg-gray-100" : "bg-white"}
          >
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
          <tr
            className={
              (dataSafe.length + 1) % 2 === 0 ? "bg-gray-100" : "bg-white"
            }
          >
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const makeAlphabetical = (s1: string) => {
  return s1.replace(/[^a-zA-Z\s+]/gi, "");
};

const makeNumerical = (s1: string) => {
  return s1.replace(/[^0-9]/gi, "");
};

const makeNumericalSpaced = (s1: string) => {
  let intermediate = makeNumerical(s1);
  let s = "";

  for (let i = intermediate.length - 1; i >= 0; i--) {
    s = intermediate[i] + s;
    let j = intermediate.length - i;
    if (j !== 1 && j % 3 === 0 && j !== intermediate.length) s = " " + s;
  }

  return s;
};

type userFormProps = {
  firstName: string;
  lastName: string;
  gender: string;
  salutation: string;
  salary: string;
  profile: string;
  employeeId: string;
  mutate: Query.UseMutateFunction<void, unknown, user, unknown>;
};

const UserForm = ({
  firstName,
  lastName,
  gender,
  salutation,
  salary,
  profile,
  employeeId,
}: userFormProps) => {
  const { register, handleSubmit, setValue } = useForm({
    reValidateMode: "onSubmit",
    defaultValues: {
      firstName,
      lastName,
      gender,
      salutation,
      salary,
      profile,
      employeeId,
    },
  });

  // watch not playing nice with setValue so do this manually
  let [currentFirstName, setFirstName] = useState(firstName);
  let [currentLastName, setLastName] = useState(lastName);
  let [currentSalutation, setCurrentSalutation] = useState(salutation);
  let [currentProfile, setCurrentProfile] = useState(profile);

  let updateProfile = ({
    target: { value: x },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProfile(x);
  };

  let resetForm = () => {
    setValue("firstName", firstName);
    setFirstName(firstName);
    setValue("lastName", lastName);
    setLastName(lastName);
    setValue("gender", gender);
    setValue("salutation", salutation);
    setCurrentSalutation(salutation);
    setValue("salary", salary);
    setValue("profile", profile);
    setCurrentProfile(profile);
    setValue("employeeId", employeeId);
  };

  let fullName = currentFirstName + " " + currentLastName;

  return (
    <div className="w-10/12 flex flex-col items-center justify-center mx-auto border border-gray-200 mt-20">
      <h2 className="font-bold mt-5 mb-2">{"Employee Information"}</h2>
      <form
        className="w-10/12"
        onSubmit={handleSubmit((data) => console.log(data))}
      >
        <div className="mx-4 w-full my-4">
          <div className="w-60 ml-auto">
            <button
              className="bg-gray-300 hover:bg-gray-400 mx-2 px-4 rounded"
              onClick={resetForm}
            >
              Cancel
            </button>
            <button
              className={
                "mx-2 px-4 rounded" +
                ` ${colorToTailwindBGSafe(
                  currentProfile
                )} ${hoverBackgroundProfile(currentProfile)} ${
                  currentProfile !== "DEFAULT" ? "text-white" : ""
                }`
              }
              type="submit"
            >
              Save
            </button>
          </div>
        </div>

        <div className="w-full flex flex-col lg:flex-row justify-between mb-8">
          <div className="flex flex-col">
            <div>
              <label htmlFor="first-name" className="mr-4 w-32 inline-block">
                First Name(s) *
              </label>
              <input
                type="text"
                id="first-name"
                className="border-black border w-64 h-6"
                {...register("firstName")}
                onChange={({ target: { value: f } }) => {
                  let x = makeAlphabetical(f);
                  if (f !== x) {
                    setValue("firstName", x);
                  }
                  setFirstName(x);
                }}
              ></input>
            </div>

            <div className="mt-4">
              <label htmlFor="last-name" className="mr-4 w-32 inline-block">
                Last Name *
              </label>
              <input
                type="text"
                id="last-name"
                className="border-black border w-64 h-6"
                {...register("lastName")}
                onChange={({ target: { value: f } }) => {
                  let x = makeAlphabetical(f);
                  if (f !== x) {
                    setValue("lastName", x);
                  }
                  setLastName(x);
                }}
              ></input>
            </div>

            <div className="mt-4">
              <label htmlFor="first-name" className="mr-4 w-32 inline-block">
                Salutation *
              </label>
              <select
                className="w-64 h-6"
                {...register("salutation")}
                onChange={({ target: { value: x } }) => {
                  if (x === "MR") {
                    setValue("gender", "M");
                  }
                  if (x === "MS" || x === "MRS") {
                    setValue("gender", "F");
                  }
                  if (x === "MX") {
                    setValue("gender", "U");
                  }
                  setCurrentSalutation(x);
                }}
              >
                <option className="w-36" value="MR">
                  Mr.
                </option>
                <option className="w-36" value="MS">
                  Ms.
                </option>
                <option className="w-36" value="MRS">
                  Mrs.
                </option>
                <option className="w-36" value="DR">
                  Dr.
                </option>
                <option className="w-36" value="MX">
                  Mx.
                </option>
              </select>
            </div>

            <div className="mt-4 flex">
              <span className="mr-4 w-32 inline-block">Gender * </span>
              <span className="w-64 flex justify-between">
                <div>
                  <input
                    type="radio"
                    id="male"
                    value="M"
                    className="mr-1"
                    {...register("gender")}
                    disabled={currentSalutation !== "DR"}
                  />
                  <label htmlFor="male">Male</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="female"
                    value="F"
                    className="mr-1"
                    {...register("gender")}
                    disabled={currentSalutation !== "DR"}
                  />
                  <label htmlFor="female">Female</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="unspecified"
                    value="U"
                    className="mr-1"
                    {...register("gender")}
                    disabled={currentSalutation !== "DR"}
                  />
                  <label htmlFor="unspecified">Unspecified</label>
                </div>
              </span>
            </div>

            <div className="mt-4">
              <label htmlFor="employee-id" className="mr-4 w-32 inline-block">
                Employee Id *
              </label>
              <input
                type="text"
                id="employee-id"
                className="border-black border w-64 h-6 appearance-none"
                {...register("employeeId")}
                onChange={({ target: { value: f } }) => {
                  let x = makeNumerical(f);
                  if (f !== x) {
                    setValue("employeeId", x);
                  }
                }}
              ></input>
            </div>
          </div>

          <div className="flex flex-col">
            <div>
              <label htmlFor="first-name" className="mr-4 w-44 inline-block">
                Full Name
              </label>
              <input
                type="text"
                id="first-name"
                className="border-black border w-72 h-6 text-gray-500"
                disabled
                value={fullName}
                key={fullName}
              ></input>
            </div>

            <div className="mt-4">
              <label htmlFor="first-name" className="mr-4 w-44 inline-block">
                Gross Salary $PY
              </label>
              <input
                type="text"
                id="first-name"
                className="border-black border w-72 h-6"
                {...register("salary")}
                onChange={({ target: { value: f } }) => {
                  let x = makeNumericalSpaced(f);
                  if (f !== x) {
                    setValue("salary", x);
                  }
                }}
              ></input>
            </div>

            <div className="mt-4 flex">
              <span className="mr-4 w-44 inline-block">
                Employee Profile Color
              </span>
              <span className="w-72 flex justify-between">
                <div>
                  <input
                    type="radio"
                    id="green"
                    value="GREEN"
                    className="mr-1"
                    {...register("profile")}
                    onChange={updateProfile}
                  />
                  <label htmlFor="green">Green</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="blue"
                    value="BLUE"
                    className="mr-1"
                    {...register("profile")}
                    onChange={updateProfile}
                  />
                  <label htmlFor="blue">Blue</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="red"
                    value="RED"
                    className="mr-1"
                    {...register("profile")}
                    onChange={updateProfile}
                  />
                  <label htmlFor="red">Red</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="default"
                    value="DEFAULT"
                    className="mr-1"
                    {...register("profile")}
                    onChange={updateProfile}
                  />
                  <label htmlFor="default">Default</label>
                </div>
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

UserForm.defaultProps = {
  firstName: "",
  lastName: "",
  gender: "M",
  salutation: "MR",
  salary: "",
  profile: "DEFAULT",
  employeeId: "",
};

export default App;
