import React from 'react';
import PropTypes from 'prop-types';

import {Panel} from '@vkontakte/vkui';
import Wheel from "./Wheel";

const Home = ({id, go, fetchedUser}) => (
    <Panel id={id}>
        {fetchedUser &&
        <>
            <Wheel photo={fetchedUser.photo_200 ? fetchedUser.photo_200 : null}
                   name={`${fetchedUser.first_name} ${fetchedUser.last_name}`}/>
        </>
        }
    </Panel>
);

Home.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
    fetchedUser: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
};

export default Home;
