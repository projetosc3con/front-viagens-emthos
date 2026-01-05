import styled from "styled-components";
import { StylesConfig } from 'react-select';

export const Container = styled.div`

`;

export const customSelectStyles = (): StylesConfig<{ value: string; label: string }, false> => ({
  control: (provided) => ({
    ...provided,
    backgroundColor: 'transparent',
    border:'1px solid rgba(145, 158, 171, .32)',
    color: '#edf6f9',
    height: '2.5rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#B85A5A',
    },
    '&:focus': {
      border: '1px solid #B85A5A'
    }
  }),
  input: (provided) => ({
    ...provided,
    color: '#edf6f9'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#444',
    border: 'rgba(145, 158, 171, .32)',
    marginTop: '0',
    zIndex: 9,
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: '#444',
    padding: 0,
    // Scrollbar para WebKit (Chrome, Safari, Edge)
    '::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: '#333',    // fundo da track
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: '#9f9f9f', // cor da "bolinha"
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-track': {
      backgroundColor: '#444',    // fundo atrás da thumb
    },
    // Scrollbar para Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: '#9f9f9f #333',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: 'rgba(145, 158, 171, .32)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#B85A5A' : 'transparent',
    color: state.isFocused ? '#fff' : '#edf6f9',
    fontWeight: 300,
    '&:active': {
      boxShadow: '0 0 5px 2px rgba(184, 90, 90, 0.25)',
      background: '#B85A5A'
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    fontWeight: 300,
    color: '#edf6f9'
  }),
});