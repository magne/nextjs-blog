# Site layout

```
<html>
  <head>
    <title />
    <meta ... />
    <link ... />
    <script dark-theme />
    <script ... />
    <noscript ... />
    <style .../>
  </head>
  <body>
    <div __next>
      <div layout_container>
        <header layout_header>
        </header>
          <h1 />
        <main>
          { children }
        </main>
      </div>
    </div>

    <!-- next & react stuff -->
  </body>
</html>
```