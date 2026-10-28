import { useState } from "react";
import { makeRequest } from "../../axios";
import "./terms.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Switch from "@mui/material/Switch";
import DisabledByDefault from "@mui/icons-material/DisabledByDefault";

const Terms = ({ setOpenTerms }) => {
  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    setChecked(!checked);
  };

  return (
    <div className="terms">
      <div className="wrapper">
        <h1>Privacy Policy</h1>
        <p>
          This Privacy Policy outlines the manner in which we collect, use,
          maintain, and disclose information gathered from users engaging in
          social media posts on our platform. We are committed to ensuring the
          privacy and security of your personal information. By participating in
          social media activities on our platform, you agree to the terms of
          this Privacy Policy.
        </p>
        <h4>Information Collection</h4>
        <p>
          We may collect personal and non-personal information when you interact
          with our social media platform, including but not limited to:
        </p>
        <h5>Personal Information:</h5>
        <ul>
          <li>Full name</li>
          <li>Contact information (email address, phone number)</li>
          <li>Profile information (profile picture, bio)</li>
        </ul>
        <h5>Non-Personal Information:</h5>
        <ul>
          <li>Browser type</li>
          <li>IP address</li>
          <li>Device information</li>
          <li>Usage data (interaction with posts, comments, likes)</li>
        </ul>
        <h4>Use of Information</h4>
        <p>We use the collected information for the following purposes:</p>
        <h5>Communication:</h5>
        <ul>
          <li>To respond to comments, messages, or inquiries.</li>
          <li>
            To notify users about updates, promotions, and relevant information.
          </li>
        </ul>
        <h5>Analytics:</h5>
        <ul>
          <li>
            To analyze user behavior and improve our social media content.
          </li>
          <li>
            To track engagement and assess the effectiveness of our posts.
          </li>
        </ul>
        <h5>Security:</h5>
        <ul>
          <li>
            To protect against unauthorized access, maintain data accuracy, and
            ensure the appropriate use of information.
          </li>
        </ul>
        <h4>Information Sharing</h4>
        <p>
          We do not sell, trade, or rent users' personal information to third
          parties. However, we may share aggregated, non-personal information
          with our partners for analytical and promotional purposes.
        </p>
        <h4>Third-Party Links</h4>
        <p>
          Our social media posts may contain links to third-party websites. We
          are not responsible for the privacy practices of these external sites.
          Users are encouraged to review the privacy policies of any third-party
          sites they visit.
        </p>
        <h4>Data Security</h4>
        <p>
          We implement appropriate data collection, storage, and processing
          practices to protect against unauthorized access, alteration,
          disclosure, or destruction of your personal information.
        </p>
        <h4>Changes to the Privacy Policy</h4>
        <p>
          We reserve the right to update this Privacy Policy at any time. Users
          are encouraged to check this page regularly for any changes. By
          continuing to engage with our social media platform, you acknowledge
          and agree to the updated Privacy Policy.
        </p>
        <h4>Contact Information</h4>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at lavozadmi1995@gmail.com.
        </p>
        <p>This Privacy Policy was last updated on 12/12/2023</p>
        <button className="close" onClick={() => setOpenTerms(false)}>
          <DisabledByDefault style={{ color: "red" }} />
        </button>
      </div>
    </div>
  );
};

export default Terms;
