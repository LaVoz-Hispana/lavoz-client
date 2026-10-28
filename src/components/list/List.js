import { React, useState } from "react";

function List(props) {
  const data = [
    {
      id: 1,
      username: "test2",
    },
    {
      id: 2,
      username: "johndoe",
    },
  ];

  const filteredData = data.filter((el) => {
    //if no input the return the original
    if (props.input === "") {
      return el;
    }
    //return the item which contains the user input
    else {
      return el.username.includes(props.input);
    }
  });

  return (
    <ul>
      {filteredData.map((item) => (
        <li key={item.id}>{item.username}</li>
      ))}
    </ul>
  );
}

export default List;
