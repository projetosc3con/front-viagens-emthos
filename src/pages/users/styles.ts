import styled from "styled-components";
import { StylesConfig } from 'react-select';

export const ListItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background-color: #444;
    border-radius: .5rem;

    
`;

export const ListBox = styled.div`

    .btn-primary {
        border-radius: 0.375rem 0 0 0.375rem;
    }

    .btn-danger {
        border-radius: 0 0.375rem 0.375rem 0;
        height: 2.4rem;
    }
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
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#444',
    border: 'rgba(145, 158, 171, .32)',
    marginTop: '0',
    zIndex: 9,
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