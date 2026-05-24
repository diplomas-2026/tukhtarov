### Рисунок 2.29 — Фрагменткода контроллера авторизации

### [Скрин кода](./img_1.png)

```java
@PostMapping("/auth/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    log.info("Login attempt: {}", request.login());
    AppUser user = appUserRepository.findByLoginIgnoreCaseOrEmailIgnoreCase(request.login(), request.login())
            .orElseThrow(() -> new IllegalArgumentException("Неверный логин или пароль"));
    if (!user.isActive()) {
        log.warn("Login rejected, user disabled: {}", request.login());
        throw new IllegalArgumentException("Пользователь отключён");
    }
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
        log.warn("Login rejected, invalid password: {}", request.login());
        throw new IllegalArgumentException("Неверный логин или пароль");
    }
    log.info("Login successful: {} ({})", user.getLogin(), user.getRole());
    return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
}
```

### Рисунок 2.30 — Фрагменткода контроллера заказов

### [Скрин кода](./img_2.png)

```java
@PostMapping("/orders")
public OrderDetailsDto create(@RequestBody CreateOrderRequest request,
                              @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.createOrder(request, currentUser);
}

@PatchMapping("/orders/{id}")
public OrderDetailsDto update(@PathVariable Long id,
                              @RequestBody UpdateOrderRequest request,
                              @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.updateOrder(id, request, currentUser);
}
```

### Рисунок 2.31 — Фрагменткода изменения статуса заказа

### [Скрин кода](./img_3.png)

```java
@PatchMapping("/orders/{id}/status")
public OrderDetailsDto changeStatus(@PathVariable Long id,
                                    @RequestBody ChangeStatusRequest request,
                                    @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.changeStatus(id, request, currentUser);
}
```

### Рисунок 2.32 — Фрагменткода комментариев и чата заказа

### [Скрин кода](./img_4.png)

```java
@PostMapping("/orders/{id}/chat/messages")
public OrderDetailsDto sendChatMessage(@PathVariable Long id,
                                       @Valid @RequestBody CreateCommentRequest request,
                                       @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.addChatMessage(id, request, currentUser);
}

@GetMapping("/orders/{id}/chat/messages")
public List<CommentDto> chatMessages(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getChatMessages(id, currentUser);
}
```

### Рисунок 2.33 — Фрагменткода управления пользователями

### [Скрин кода](./img_5.png)

```java
@PostMapping("/users")
public UserDto create(@RequestBody CreateUserRequest request,
                      @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.createUser(request, currentUser);
}

@PatchMapping("/users/{id}")
public UserDto update(@PathVariable Long id,
                      @RequestBody UpdateUserRequest request,
                      @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.updateUser(id, request, currentUser);
}
```

### Рисунок 2.34 — Фрагменткода управления клиентами

### [Скрин кода](./img_6.png)

```java
@PostMapping("/clients")
public ClientDto create(@RequestBody CreateClientRequest request,
                        @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.createClient(request, currentUser);
}

@PatchMapping("/clients/{id}")
public ClientDto update(@PathVariable Long id,
                        @RequestBody UpdateClientRequest request,
                        @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.updateClient(id, request, currentUser);
}
```

### Рисунок 2.35 — Фрагментклиентского кода API-запросов

### [Скрин кода](./img_7.png)

```javascript
async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch (error) {
      // Ignore parse errors and keep the fallback message.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

### Листинг кода программного продукта страниц на 3-4.

```java
@PostMapping("/auth/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    log.info("Login attempt: {}", request.login());
    AppUser user = appUserRepository.findByLoginIgnoreCaseOrEmailIgnoreCase(request.login(), request.login())
            .orElseThrow(() -> new IllegalArgumentException("Неверный логин или пароль"));
    if (!user.isActive()) {
        log.warn("Login rejected, user disabled: {}", request.login());
        throw new IllegalArgumentException("Пользователь отключён");
    }
    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
        log.warn("Login rejected, invalid password: {}", request.login());
        throw new IllegalArgumentException("Неверный логин или пароль");
    }
    log.info("Login successful: {} ({})", user.getLogin(), user.getRole());
    return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
}

@PostMapping("/auth/register")
public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    String login = request.login().trim();
    String email = request.email().trim();
    if (appUserRepository.existsByLoginIgnoreCase(login)) {
        throw new IllegalArgumentException("Логин уже занят");
    }
    if (appUserRepository.existsByEmailIgnoreCase(email)) {
        throw new IllegalArgumentException("Email уже используется");
    }

    ClientCompany company = clientCompanyRepository.save(ClientCompany.builder()
            .name(request.companyName().trim())
            .contactPerson(request.fullName().trim())
            .phone(request.phone())
            .email(email)
            .build());

    AppUser user = appUserRepository.save(AppUser.builder()
            .login(login)
            .fullName(request.fullName().trim())
            .email(email)
            .phone(request.phone())
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(com.github.danbel.tukhtarovapi.domain.enumtype.UserRole.CLIENT)
            .active(true)
            .clientCompany(company)
            .build());

    log.info("Registration successful: {} ({})", user.getLogin(), user.getRole());
    return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
}

@GetMapping("/auth/me")
public UserDto me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
    AppUser user = appUserRepository.findById(currentUser.id())
            .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    return ApiMapper.toUserDto(user);
}

@GetMapping("/orders")
public List<OrderSummaryDto> orders(@AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.findVisibleOrders(currentUser);
}

@GetMapping("/orders/{id}")
public OrderDetailsDto order(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getOrder(id, currentUser);
}

@PostMapping("/orders")
public OrderDetailsDto create(@RequestBody CreateOrderRequest request,
                              @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.createOrder(request, currentUser);
}

@PatchMapping("/orders/{id}")
public OrderDetailsDto update(@PathVariable Long id,
                              @RequestBody UpdateOrderRequest request,
                              @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.updateOrder(id, request, currentUser);
}

@PatchMapping("/orders/{id}/status")
public OrderDetailsDto changeStatus(@PathVariable Long id,
                                    @RequestBody ChangeStatusRequest request,
                                    @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.changeStatus(id, request, currentUser);
}

@PostMapping("/orders/{id}/comments")
public OrderDetailsDto addComment(@PathVariable Long id,
                                  @Valid @RequestBody CreateCommentRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.addChatMessage(id, request, currentUser);
}

@GetMapping("/orders/{id}/comments")
public List<CommentDto> comments(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getChatMessages(id, currentUser);
}

@GetMapping("/orders/{id}/chat/state")
public ChatStateDto chatState(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getChatState(id, currentUser);
}

@GetMapping("/orders/{id}/chat/messages")
public List<CommentDto> chatMessages(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getChatMessages(id, currentUser);
}

@PostMapping("/orders/{id}/chat/messages")
public OrderDetailsDto sendChatMessage(@PathVariable Long id,
                                       @Valid @RequestBody CreateCommentRequest request,
                                       @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.addChatMessage(id, request, currentUser);
}

@GetMapping("/orders/{id}/history")
public List<StatusHistoryDto> history(@PathVariable Long id, @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return productionOrderService.getHistory(id, currentUser);
}

@GetMapping("/users/list")
public List<UserDto> users(@AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.users(currentUser);
}

@PostMapping("/users")
public UserDto create(@RequestBody CreateUserRequest request,
                      @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.createUser(request, currentUser);
}

@PatchMapping("/users/{id}")
public UserDto update(@PathVariable Long id,
                      @RequestBody UpdateUserRequest request,
                      @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.updateUser(id, request, currentUser);
}

@GetMapping("/clients/list")
public List<ClientDto> clients(@AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.clients(currentUser);
}

@PostMapping("/clients")
public ClientDto create(@RequestBody CreateClientRequest request,
                        @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.createClient(request, currentUser);
}

@PatchMapping("/clients/{id}")
public ClientDto update(@PathVariable Long id,
                        @RequestBody UpdateClientRequest request,
                        @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return referenceDataService.updateClient(id, request, currentUser);
}

@GetMapping("/support-chat/state")
public ChatStateDto state(@RequestParam(required = false) Long clientCompanyId,
                          @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return supportChatService.getState(clientCompanyId, currentUser);
}

@GetMapping("/support-chat/messages")
public List<CommentDto> messages(@RequestParam(required = false) Long clientCompanyId,
                                 @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return supportChatService.getMessages(clientCompanyId, currentUser);
}

@PostMapping("/support-chat/messages")
public ChatStateDto send(@RequestParam(required = false) Long clientCompanyId,
                         @Valid @RequestBody CreateCommentRequest request,
                         @AuthenticationPrincipal AuthenticatedUser currentUser) {
    return supportChatService.addMessage(clientCompanyId, request, currentUser);
}
```
