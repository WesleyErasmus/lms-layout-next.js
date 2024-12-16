import React from "react";

const Assessments = () => {
  return (
    <div>
      <h2>Course A</h2>
      <h3>module 1</h3>
      <ul>
        <ul>Assessment 1 [30%] [due date]</ul>
        <li>Student A (view - integrated with Google docs || mark/100%)</li>
        <li>Student B (view || mark/100%)</li>
        <li>Student C (view || mark/100%)</li>
        <li>Student F (view || mark/100%)</li>
        <li>Assessment 2 [30%]</li>
        <li>Assessment 3 [40%]</li>
      </ul>
      <h3>module 2</h3>
      <ul>
        <li>Assessment 1</li>
        <li>Assessment 2</li>
        <li>Assessment 3</li>
      </ul>
      <h2>Course B</h2>
      <h3>module 1</h3>
      <ul>
        <li>Assessment 1</li>
      </ul>
      <h2>Course C</h2>
      <h3>module 1</h3>
      <ul>
        <li>Assessment 1</li>
        <li>Assessment 2</li>
      </ul>
    </div>
  );
};

export default Assessments;
