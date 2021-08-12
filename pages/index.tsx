import styled from "@emotion/styled";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 35vh;
`;

const Home: NextPage = () => {
  return (
    <Container>
      <main>
        <h1>Next.js dark mode toggle</h1>
        <h4>Dark mode is more than just a gimmic, right?!</h4>
        <ThemeToggle />
      </main>
    </Container>
  );
};

export default Home;
