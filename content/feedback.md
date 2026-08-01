Changes I want to make...

- Structured Logging & Observability (Datadog) -> Lets include things like Sentry as well.

- About Section

- I want to include more concepts from the improvements.md section about who I am:

> I want my tagline to be stronger and more impactful. I am trying to capture the essence of who I
> am as an engineer, which is a highly detailed oriented, motivated and product focused engineer who
> is constantly thinking about ways to improve the product and the impact it has on the user. I want
> to emphasize that I am not just a ticket closer, but someone who is deeply invested in the product
> and takes ownership of it. I want to show that I am always looking for ways to improve the product
> and make it better for the user, and that I am not satisfied with just doing the bare minimum. I
> want to show that I am a proactive and driven engineer who is always looking for ways to make a
> positive impact on the product and the user experience. I want to communicate how I work
> tirelessly to improve the product and become psychological invested in it, always thinking about
> ways to make it better and identifying areas for improvement.

- Craft Features

For the features listed in the craft section, I want each one to discuss things more related to
architectural patterns and design, rather than specifics of the feature. For example, for the skills
feature, I want to discuss the architectural patterns and design decisions that went into building
the feature.

Also, please remove all references to Statsig and feature flag development.

- ESLint References

Let's remove specific ESLint references from the resume and focus instead on the broader concept of
improving code quality and maintainability through linting and code reviews. We can discuss how we
implemented a robust linting strategy and code review process to ensure high code quality and
consistency across the codebase, without mentioning specific tools or libraries. This way, we can
highlight our commitment to code quality and maintainability without getting bogged down in specific
implementations that may change over time.

- Architecture

For this section, I want to focus more on the architectural patterns and design decisions that went
into building the features, rather than specific implementations. For example, instead of discussing
the specific implementation of server-side rendering and caching, we can discuss the architectural
patterns and design decisions that led us to choose that approach, and how it improved the
performance and user experience of the product. This way, we can highlight our ability to make
strategic architectural decisions that have a positive impact on the product and the user
experience.

Additionally, I for the bundle analysis work, page loading performance work, and NextJS security
vulnerability, I want to speak in terms of those architectural changes having already been applied,
since we are nearly done with them anyways. I want to discuss how I identified these issues, planned
remediation, planned implementation and coordinated with product to communicate the impact to users,
and then executed on the implementation and deployment of these changes. This way, we can highlight
our ability to identify and address architectural issues in a strategic and effective way, and how
those changes have already had a positive impact on the product and the user experience.

Additionally, I want to discuss how the architectural changes and improvements I brought forward
decreased TTI and LCP by significant margins, and how that has improved the user experience and
engagement with the product. I want to mention how it made our TTI workaround measurement more
accurate, improved security by focusing auth server side, and dramatically increased the speed of
client side navigations and server-side initial page loads.

Let's also remove specific references to `@craft/logger` and specific references to other package
names, and instead focus on the broader architectural patterns and design decisions that went into
building the logging and observability system. We can discuss how we implemented a structured
logging system that allows us to capture rich contextual information about the application's
behavior and performance, without mentioning specific tools or libraries. This way, we can highlight
our ability to design and implement effective logging and observability systems that improve our
ability to monitor and troubleshoot the application, without getting bogged down in specific
implementations that may change over time.

Also, for the architecture section under craft, lets ensure that we are bullet pointing or numbering
those sub-items.
