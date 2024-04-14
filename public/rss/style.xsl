<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="3.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" omit-xml-declaration="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>
          <xsl:value-of select="/rss/channel/title" /> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script src="rss/toggle-theme.js" type="text/javascript"></script>
        <link rel="stylesheet" type="text/css" href="rss/rss-style.css" />
        
      </head>
      <body>
        <header class="banner">
          
          <div class="subscribe">
            <strong>This is a web feed,</strong> also known as an RSS feed. <strong>Subscribe</strong> by copying the URL from the address bar into your newsreader. 
          </div>
          <div class="theme-toggle-container">
            <label class="theme-switch">
              <input type="checkbox" id="theme-toggle"/>
              <span class="slider round"></span>
            </label>
            <span id="toggle-label">Light Mode</span>
          </div>
        </header>

        <section>
          <h1 class="title">
            <xsl:value-of select="/rss/channel/title" /> RSS Feed Preview </h1>
          <p class="description">
            <xsl:value-of select="/rss/channel/description" />
            <a target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link" />
              </xsl:attribute>Visit
  Website &#x2192; </a>
          </p>
        </section>
        <main>
          <h2>Recent Items</h2>
          
          <ul class="posts">
            <xsl:for-each select="/rss/channel/item[position() &lt; 10]">
              <li class="posts__post post">
                <h3 class="post__title">
                  <a target="_blank" href="{ link }" class="post__link">
                    <xsl:value-of select="title"/>
                  </a>
                </h3>
                
                <p> By: <xsl:value-of select="author" /></p>
                <p class="post__details"><small>Published: <xsl:value-of select="pubDate" /></small> // <small>Category: <xsl:value-of select="category"/></small></p>
                
                <p class="post__preview">
                  <strong>Description: </strong>
                  <xsl:value-of select="description"/>
                  <a href="{ link }" class="post__more">Read more</a>
                </p>

              </li>
            </xsl:for-each>
          </ul>

          <p class="cta">
            <a target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link" />
              </xsl:attribute> View all posts on <strong><xsl:value-of select="/rss/channel/title" /></strong>
            </a>
          </p>
        </main>

      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>