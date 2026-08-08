import { InstagramEmbed, TikTokEmbed } from 'react-social-media-embed';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';
import "./embed.scss";
import { useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from '../../axios';
import { isAdmin } from "../../utils/admin";

const Embed = ({ embed }) => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const handleClick = (e) => {
    e.preventDefault();
    deleteMutation.mutate();
  }
  const embedId = embed.id;
  console.log(embed);

  const deleteMutation = useMutation({
    mutationFn: () => {
      return makeRequest.delete("/embeds/" + embedId);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["embeds"]);
    },
  });

  return (
    <div className='embed'>
        {isAdmin(currentUser) &&
            <button className='delete-embed' onClick={handleClick}>
                <DisabledByDefaultIcon/>
            </button>
        }
        {embed.type === 'tiktok' ? (
            <TikTokEmbed url={embed.link} />
            ) : (
            <InstagramEmbed url={embed.link} />
            )
        }       
    </div>
  );
};

export default Embed;
