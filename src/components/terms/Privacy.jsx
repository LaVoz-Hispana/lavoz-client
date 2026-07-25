import { useState } from "react";
import { makeRequest } from "../../axios";
import "./terms.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Switch from '@mui/material/Switch';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';

const Privacy = ({ setOpenPrivacy }) => {
    const [checked, setChecked] = useState(false);

    const handleToggle = () => {
      setChecked(!checked);
    };
  
    return (
      <div className="terms">
        <div className="wrapper">
          <h1>Terms of Use</h1>
          <p>Terms of use for Poststation.link</p>  
          <p>Last update: 12/12/2023</p>  
          <p>
            Welcome to Postsstation, an online platform for news and social publishing. By accessing or using our 
            website at www.poststation.link you agree to comply with and be bound by the following Terms of Use. 
            If you do not agree to these terms, please do not use the Site.
          </p>  

          <p>1. Content and user conduct</p>
          <p>1.1. Information Accuracy: We strive to provide accurate and up-to-date information on our Site. Poststation.link provides content for informational purposes only.</p>
          <p>1.1. User-generated content: Users can contribute content such as articles, comments, and posts. All content is subject to prior review for publication. Obscene language, defamation, or threats are not allowed. By posting content, you grant Poststation.link a royalty-free, non-exclusive, royalty-free, worldwide, perpetual license to use, reproduce, modify, adapt, publish, translate, create derivative works , distribute and display said content.</p>
          <p>1.2. Responsible Conduct: Users are prohibited from engaging in activities that may compromise the security or integrity of the Site, infringe the rights of others, or violate any applicable laws. Poststation.link reserves the right to remove content and suspend or terminate user accounts for violations.</p>
          <p>2. Intellectual property</p>
          <p>2.1. Ownership: All original and exclusive content on the Site, including articles, videos and images, is the property of [Your Website Name] and is protected by copyright and other intellectual property laws.</p>
          <p>2.2. Use of Content: Users may access and use the content of the Site for personal, non-commercial purposes. Any other use, including reproduction, distribution or modification, requires the prior written consent of Poststation.link.</p>
          <p>2.3. User Accounts: To access certain features of the Site, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
          <p>3. Third party links</p>
          <p>The Site may contain links to third party websites. It is not responsible for the content policies, privacy policies or practices of these third party sites. Users access these links at their own risk.</p>
          <p>4. Termination</p>
          <p>Poststation.link reserves the right to terminate or suspend user accounts, remove content, or discontinue the Site in its sole discretion, without notice, for any reason.</p>
          <p>5. Changes to the terms</p>
          <p>We may update these Terms of Use from time to time. Users will be notified of material changes and continued use of the Site constitutes acceptance of the modified terms.</p>
          <p style={{fontWeight: "bold"}}>Poststation.link</p>
          <p>P. O. Box 1774</p>
          <p>Bryan, TX 77806</p>
          <p style={{color: 'blue', textDecoration: "underline"}}>lavozadmi1995@gmail.com.</p>
          {/* <div className="row">
              <label>I agree to the privacy policy.</label>
                <Switch
                  checked={checked}
                  onChange={handleToggle}
                />
            </div> */}
          <button className="close" onClick={() => setOpenPrivacy(false)}>
            <DisabledByDefaultIcon style={{color: "red"}}/>
          </button>
        </div>
      </div>
    );
  };
  
  export default Privacy;
