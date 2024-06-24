import React, { useState } from 'react';
import '../styles/Auth.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Auth: React.FC = () => {

    const [password, setPassword] = useState<string>('');

    const navigate = useNavigate();

    const auth = useAuth();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (password !== "Admin123") {
            Notify.failure('Password is incorrect!');
        } else {
            Notify.success('Password is correct!');
            auth.login();
            navigate('/list');
        }
    }

    return (
        <form action="" className='auth' onSubmit={handleSubmit}>
            <label className='auth__name'>
                Password
                <input type="password" className='auth__input' value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </label>
            <button type='submit' className='auth__btn'>Log In</button>
        </form>
    )
};

export {Auth}