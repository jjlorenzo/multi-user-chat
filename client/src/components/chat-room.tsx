import { MessageForm, MessageList, UserList } from "."

export function ChatRoom() {
  return (
    <div class="py-3 h-100">
      <div class="card shadow-sm h-100">
        <div class="row g-0 h-100">
          <div class="col-4 h-100 py-2 border-end">
            <div class="d-flex flex-column h-100">
              <UserList />
            </div>
          </div>
          <div class="col-8 h-100 py-2">
            <div class="d-flex flex-column h-100">
              <MessageList />
              <MessageForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
