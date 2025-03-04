// src/components/ui/Badge.jsx
import styled from "styled-components";

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
  background-color: #007bff;
  color: white;

  /* Variants */
  ${({ variant }) =>
    variant === "secondary" &&
    `
    background-color: #6c757d;
  `}

  ${({ variant }) =>
    variant === "outline" &&
    `
    background-color: transparent;
    border: 1px solid #007bff;
    color: #007bff;
  `}
`;
