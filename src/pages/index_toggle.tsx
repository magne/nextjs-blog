import styled from "@emotion/styled";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const ThemeToggle = dynamic(() => import("../components/ThemeToggle"), {
  ssr: false,
});

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 35vh;
`;

const Home: NextPage = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
      const wb = (window as any).workbox


      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event: any) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        if (confirm('A newer version of this web app is available, reload to update?')) {
          wb.addEventListener('controlling', (event: any) => {
            window.location.reload()
          })

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting()
        } else {
          console.log(
            'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.'
          )
        }
      }

      wb.addEventListener('waiting', promptNewVersionAvailable) 
      
      // never forget to call register as auto register is turned off in next.config.js
      wb.register()
    }
  }, [])
  
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
